"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentStudentId } from "@/lib/auth";
import {
  awardActivity,
  hasActivityTodayOfType,
  hasActivityForRef,
  levelProgress,
} from "@/lib/gamification";

/**
 * Gamificação do aluno (leitura + check-in). A escrita de ganhos por exame vive
 * nas actions de submissão/correção; aqui ficam o perfil e o check-in diário.
 */

/** Perfil de jogo do aluno autenticado (valores a zero se ainda não existir). */
export async function getMyGameProfile() {
  const studentId = await getCurrentStudentId();
  const p = await prisma.studentGameProfile.findUnique({ where: { studentId } });
  const xp = p?.xp ?? 0;
  const prog = levelProgress(xp);
  return {
    xp,
    level: p?.level ?? 1,
    books: p?.books ?? 0,
    currentStreak: p?.currentStreak ?? 0,
    longestStreak: p?.longestStreak ?? 0,
    levelInto: prog.into,
    levelNeeded: prog.needed,
  };
}

/**
 * Regista o check-in diário (mantém o streak vivo). Idempotente por dia —
 * best-effort, nunca lança para a página que o invoca.
 */
export async function recordDailyCheckin(): Promise<void> {
  try {
    const studentId = await getCurrentStudentId();
    if (!(await hasActivityTodayOfType(studentId, "DAILY_CHECKIN"))) {
      await awardActivity(studentId, "DAILY_CHECKIN");
    }
  } catch {
    // Sem sessão de aluno ou falha pontual — ignora.
  }
}

export type MarkResult = { ok: true; xp: number; books: number; already?: boolean } | { ok: false };

/** Marca uma aula agendada como vista (1× por agendamento). Valida pertença à turma. */
export async function markLessonDone(scheduleId: string): Promise<MarkResult> {
  try {
    const studentId = await getCurrentStudentId();
    const schedule = await prisma.lessonSchedule.findFirst({
      where: { id: scheduleId, class: { students: { some: { id: studentId } } } },
      select: { id: true },
    });
    if (!schedule) return { ok: false };
    if (await hasActivityForRef(studentId, "LESSON_DONE", scheduleId)) {
      return { ok: true, xp: 0, books: 0, already: true };
    }
    const { xp, books } = await awardActivity(studentId, "LESSON_DONE", { refId: scheduleId });
    return { ok: true, xp, books };
  } catch {
    return { ok: false };
  }
}

/** Marca um material como lido (1× por material). Valida acesso via turma/curso. */
export async function markMaterialRead(materialId: string): Promise<MarkResult> {
  try {
    const studentId = await getCurrentStudentId();
    const material = await prisma.material.findFirst({
      where: {
        id: materialId,
        OR: [
          { course: { classes: { some: { students: { some: { id: studentId } } } } } },
          { module: { course: { classes: { some: { students: { some: { id: studentId } } } } } } },
          { topic: { module: { course: { classes: { some: { students: { some: { id: studentId } } } } } } } },
        ],
      },
      select: { id: true },
    });
    if (!material) return { ok: false };
    if (await hasActivityForRef(studentId, "MATERIAL_READ", materialId)) {
      return { ok: true, xp: 0, books: 0, already: true };
    }
    const { xp, books } = await awardActivity(studentId, "MATERIAL_READ", { refId: materialId });
    return { ok: true, xp, books };
  } catch {
    return { ok: false };
  }
}
