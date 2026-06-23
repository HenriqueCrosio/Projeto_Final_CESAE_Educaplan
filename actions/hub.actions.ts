"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentStudentId } from "@/lib/auth";
import type { RewardType } from "@prisma/client";

/**
 * Customização do Hub de Estudos (G3). O aluno equipa banner/paleta e destaca
 * badges — só itens que POSSUI (validado contra StudentReward).
 */

const MAX_FAVORITES = 6;

export type OwnedCosmetic = {
  id: string;
  name: string;
  rarity: string;
  type: string;
  payload: unknown;
};

export async function getHubConfig() {
  const studentId = await getCurrentStudentId();
  const [config, owned, profile, student] = await Promise.all([
    prisma.studentHubConfig.findUnique({ where: { studentId } }),
    prisma.studentReward.findMany({ where: { studentId }, select: { item: true }, orderBy: { acquiredAt: "desc" } }),
    prisma.studentGameProfile.findUnique({ where: { studentId }, select: { xp: true, level: true, books: true } }),
    prisma.student.findUnique({ where: { id: studentId }, select: { user: { select: { email: true, profile: { select: { displayName: true } } } } } }),
  ]);

  const items = owned.map((o) => o.item);
  const pick = (t: string): OwnedCosmetic[] =>
    items.filter((i) => i.type === t).map((i) => ({ id: i.id, name: i.name, rarity: i.rarity, type: i.type, payload: i.payload }));

  return {
    displayName: student?.user.profile?.displayName ?? null,
    level: profile?.level ?? 1,
    xp: profile?.xp ?? 0,
    books: profile?.books ?? 0,
    bannerItemId: config?.bannerItemId ?? null,
    paletteItemId: config?.paletteItemId ?? null,
    favoriteBadgeIds: ((config?.favoriteBadgeIds as string[] | null) ?? []),
    banners: pick("BANNER"),
    palettes: pick("PALETTE"),
    badges: pick("BADGE"),
  };
}

async function ownsItem(studentId: string, itemId: string, type: RewardType): Promise<boolean> {
  const found = await prisma.studentReward.findFirst({
    where: { studentId, itemId, item: { type } },
    select: { itemId: true },
  });
  return !!found;
}

export async function setHubBanner(itemId: string | null): Promise<void> {
  const studentId = await getCurrentStudentId();
  if (itemId && !(await ownsItem(studentId, itemId, "BANNER"))) throw new Error("Não possuis esse banner.");
  await prisma.studentHubConfig.upsert({
    where: { studentId },
    create: { studentId, bannerItemId: itemId },
    update: { bannerItemId: itemId },
  });
}

export async function setHubPalette(itemId: string | null): Promise<void> {
  const studentId = await getCurrentStudentId();
  if (itemId && !(await ownsItem(studentId, itemId, "PALETTE"))) throw new Error("Não possuis essa paleta.");
  await prisma.studentHubConfig.upsert({
    where: { studentId },
    create: { studentId, paletteItemId: itemId },
    update: { paletteItemId: itemId },
  });
}

/** Alterna uma badge favorita (até 6). Devolve a lista resultante. */
export async function toggleFavoriteBadge(itemId: string): Promise<string[]> {
  const studentId = await getCurrentStudentId();
  if (!(await ownsItem(studentId, itemId, "BADGE"))) throw new Error("Não possuis esse badge.");
  const config = await prisma.studentHubConfig.upsert({ where: { studentId }, create: { studentId }, update: {} });
  const current = (config.favoriteBadgeIds as string[] | null) ?? [];
  const next = current.includes(itemId)
    ? current.filter((x) => x !== itemId)
    : [...current, itemId].slice(0, MAX_FAVORITES);
  await prisma.studentHubConfig.update({ where: { studentId }, data: { favoriteBadgeIds: next } });
  return next;
}
