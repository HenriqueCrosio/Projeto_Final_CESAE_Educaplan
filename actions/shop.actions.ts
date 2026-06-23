"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentStudentId } from "@/lib/auth";

/**
 * Loja de recompensas (G2a). O aluno gasta Books em cosméticos (badges/paletas/
 * banners). Baús e boosts existem no schema mas a compra/abertura é G2b.
 */

const BUYABLE_TYPES = ["BADGE", "PALETTE", "BANNER"] as const;

export type ShopItem = {
  id: string;
  code: string;
  type: string;
  name: string;
  description: string;
  rarity: string;
  cost: number;
  requiredLevel: number;
  payload: unknown;
  featured: boolean;
  owned: boolean;
  locked: boolean; // nível insuficiente
  affordable: boolean; // books suficientes
};

/** Catálogo + estado do aluno (saldo, nível, o que possui). */
export async function getShopCatalog(): Promise<{
  books: number;
  level: number;
  items: ShopItem[];
}> {
  const studentId = await getCurrentStudentId();

  const [profile, items, owned] = await Promise.all([
    prisma.studentGameProfile.findUnique({ where: { studentId }, select: { books: true, level: true } }),
    prisma.rewardItem.findMany({
      where: { active: true, type: { in: [...BUYABLE_TYPES] } },
      orderBy: [{ featured: "desc" }, { rarity: "asc" }, { cost: "asc" }],
    }),
    prisma.studentReward.findMany({ where: { studentId }, select: { itemId: true } }),
  ]);

  const books = profile?.books ?? 0;
  const level = profile?.level ?? 1;
  const ownedIds = new Set(owned.map((o) => o.itemId));

  const mapped: ShopItem[] = items.map((it) => ({
    id: it.id,
    code: it.code,
    type: it.type,
    name: it.name,
    description: it.description,
    rarity: it.rarity,
    cost: it.cost,
    requiredLevel: it.requiredLevel,
    payload: it.payload,
    featured: it.featured,
    owned: ownedIds.has(it.id),
    locked: level < it.requiredLevel,
    affordable: books >= it.cost,
  }));

  return { books, level, items: mapped };
}

/** Itens que o aluno já possui (a coleção). */
export async function getMyCollection() {
  const studentId = await getCurrentStudentId();
  const rows = await prisma.studentReward.findMany({
    where: { studentId },
    orderBy: { acquiredAt: "desc" },
    select: { acquiredAt: true, item: true },
  });
  return rows.map((r) => ({ acquiredAt: r.acquiredAt, item: r.item }));
}

export type BuyResult =
  | { ok: true; books: number; itemName: string }
  | { ok: false; error: string };

/**
 * Compra um item: valida tipo/ativo/nível/saldo/posse e, em transação, debita os
 * books e regista a posse. Idempotente quanto a posse (não compra duas vezes).
 */
export async function buyItem(itemId: string): Promise<BuyResult> {
  const studentId = await getCurrentStudentId();

  const item = await prisma.rewardItem.findUnique({ where: { id: itemId } });
  if (!item || !item.active) return { ok: false, error: "Item indisponível." };
  if (!BUYABLE_TYPES.includes(item.type as (typeof BUYABLE_TYPES)[number])) {
    return { ok: false, error: "Este item ainda não está à venda." };
  }

  try {
    const books = await prisma.$transaction(async (tx) => {
      const profile = await tx.studentGameProfile.upsert({
        where: { studentId },
        create: { studentId },
        update: {},
      });

      const already = await tx.studentReward.findUnique({
        where: { studentId_itemId: { studentId, itemId } },
        select: { studentId: true },
      });
      if (already) throw new Error("Já possuis este item.");
      if (profile.level < item.requiredLevel) throw new Error(`Requer nível ${item.requiredLevel}.`);
      if (profile.books < item.cost) throw new Error("Books insuficientes.");

      const updated = await tx.studentGameProfile.update({
        where: { studentId },
        data: { books: profile.books - item.cost },
        select: { books: true },
      });
      await tx.studentReward.create({ data: { studentId, itemId } });
      return updated.books;
    });

    return { ok: true, books, itemName: item.name };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha na compra." };
  }
}
