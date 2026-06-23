"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentStudentId } from "@/lib/auth";
import {
  awardActivity,
  hasActivityTodayOfType,
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
