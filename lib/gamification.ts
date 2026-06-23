import "server-only";

import { prisma } from "@/lib/prisma";
import type { ActivityType } from "@prisma/client";

/**
 * Gamificação G1 — economia e motor de ganhos do aluno.
 *
 * XP acumula e define o NÍVEL (nunca se gasta). Books é a moeda gastável na loja
 * (G2). O streak conta DIAS distintos com qualquer atividade. Valores aprovados
 * com o usuário (2026-06-23) — todos centralizados aqui para afinar facilmente.
 */

// Ganhos BASE por atividade (bónus por nota soma-se no call site do EXAM_GRADED).
export const ACTIVITY_REWARDS: Record<ActivityType, { xp: number; books: number }> = {
  DAILY_CHECKIN: { xp: 5, books: 2 },
  MATERIAL_READ: { xp: 8, books: 2 },
  LESSON_DONE: { xp: 15, books: 4 },
  EXAM_SUBMITTED: { xp: 20, books: 5 },
  EXAM_GRADED: { xp: 10, books: 3 },
};

// Bónus máximo de um exame avaliado, escalado pela percentagem da nota.
export const EXAM_GRADED_MAX_BONUS = { xp: 40, books: 12 };

/** XP necessário para subir do nível L para L+1 (cada nível custa mais). */
export function xpForNextLevel(level: number): number {
  return 100 + (level - 1) * 50;
}

/** Nível resultante de um total de XP acumulado. */
export function levelFromXp(totalXp: number): number {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForNextLevel(level)) {
    remaining -= xpForNextLevel(level);
    level += 1;
  }
  return level;
}

/** Progresso dentro do nível atual: {into, needed} em XP. */
export function levelProgress(totalXp: number): { level: number; into: number; needed: number } {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForNextLevel(level)) {
    remaining -= xpForNextLevel(level);
    level += 1;
  }
  return { level, into: remaining, needed: xpForNextLevel(level) };
}

/** Bónus de exame avaliado a partir da percentagem da nota (0..1). */
export function gradedBonus(scorePct: number): { xp: number; books: number } {
  const pct = Math.max(0, Math.min(1, scorePct || 0));
  return {
    xp: Math.round(EXAM_GRADED_MAX_BONUS.xp * pct),
    books: Math.round(EXAM_GRADED_MAX_BONUS.books * pct),
  };
}

/** Meia-noite UTC do dia de uma data — chave de comparação do streak. */
function utcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Já existe um evento deste tipo (opcionalmente para um refId) hoje / de todo? */
export async function hasActivityForRef(
  studentId: string,
  type: ActivityType,
  refId: string,
): Promise<boolean> {
  const found = await prisma.activityEvent.findFirst({
    where: { studentId, type, refId },
    select: { id: true },
  });
  return !!found;
}

/** O aluno já fez uma atividade deste tipo HOJE (UTC)? Usado no check-in diário. */
export async function hasActivityTodayOfType(
  studentId: string,
  type: ActivityType,
): Promise<boolean> {
  const start = utcDay(new Date());
  const found = await prisma.activityEvent.findFirst({
    where: { studentId, type, createdAt: { gte: start } },
    select: { id: true },
  });
  return !!found;
}

/**
 * Concede uma atividade: regista o evento, soma XP/Books, recalcula o nível e
 * atualiza o streak (mesmo dia = igual, dia seguinte = +1, salto = reinicia).
 * Idempotência (dedupe por dia/ref) é responsabilidade do call site.
 */
export async function awardActivity(
  studentId: string,
  type: ActivityType,
  opts?: { refId?: string; bonusXp?: number; bonusBooks?: number },
): Promise<{ xp: number; books: number; level: number; currentStreak: number }> {
  const base = ACTIVITY_REWARDS[type];
  const baseXp = base.xp + (opts?.bonusXp ?? 0);
  const books = base.books + (opts?.bonusBooks ?? 0);

  return prisma.$transaction(async (tx) => {
    const profile = await tx.studentGameProfile.upsert({
      where: { studentId },
      create: { studentId },
      update: {},
    });

    // Boost ativo (ex.: XP a dobrar) multiplica só o XP ganho.
    const boost = await tx.studentBoost.findFirst({
      where: { studentId, type: "DOUBLE_XP", expiresAt: { gt: new Date() } },
      orderBy: { multiplier: "desc" },
      select: { multiplier: true },
    });
    const xp = boost ? Math.round(baseXp * boost.multiplier) : baseXp;

    const today = utcDay(new Date());
    const last = profile.lastActivityOn ? utcDay(profile.lastActivityOn) : null;
    let streak: number;
    if (!last) {
      streak = 1;
    } else {
      const diffDays = Math.round((today.getTime() - last.getTime()) / 86_400_000);
      if (diffDays === 0) streak = profile.currentStreak || 1;
      else if (diffDays === 1) streak = profile.currentStreak + 1;
      else streak = 1;
    }
    const longestStreak = Math.max(profile.longestStreak, streak);

    const newXp = profile.xp + xp;
    const level = levelFromXp(newXp);

    await tx.studentGameProfile.update({
      where: { studentId },
      data: {
        xp: newXp,
        level,
        books: profile.books + books,
        currentStreak: streak,
        longestStreak,
        lastActivityOn: today,
      },
    });

    await tx.activityEvent.create({
      data: { studentId, type, xp, books, refId: opts?.refId ?? null },
    });

    return { xp, books, level, currentStreak: streak };
  });
}
