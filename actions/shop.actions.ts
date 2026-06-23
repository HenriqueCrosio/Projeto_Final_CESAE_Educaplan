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

// ── G2b: boosts e baús ──

type Payload = Record<string, string | number>;
const payloadOf = (p: unknown) => (p ?? {}) as Payload;

/** Compra/ativa um boost temporário (ex.: XP a dobrar). Estende se já ativo. */
export async function buyBoost(itemId: string): Promise<BuyResult> {
  const studentId = await getCurrentStudentId();
  const item = await prisma.rewardItem.findUnique({ where: { id: itemId } });
  if (!item || !item.active || item.type !== "BOOST") return { ok: false, error: "Boost indisponível." };

  const p = payloadOf(item.payload);
  const durationH = Number(p.durationH) || 24;
  const multiplier = Number(p.multiplier) || 2;
  const boostType = String(p.boostType || "DOUBLE_XP");

  try {
    const books = await prisma.$transaction(async (tx) => {
      const profile = await tx.studentGameProfile.upsert({ where: { studentId }, create: { studentId }, update: {} });
      if (profile.level < item.requiredLevel) throw new Error(`Requer nível ${item.requiredLevel}.`);
      if (profile.books < item.cost) throw new Error("Books insuficientes.");

      const now = new Date();
      const active = await tx.studentBoost.findFirst({
        where: { studentId, type: boostType, expiresAt: { gt: now } },
        orderBy: { expiresAt: "desc" },
      });
      const base = active ? active.expiresAt : now;
      const expiresAt = new Date(base.getTime() + durationH * 3_600_000);

      if (active) {
        await tx.studentBoost.update({ where: { id: active.id }, data: { expiresAt, multiplier } });
      } else {
        await tx.studentBoost.create({ data: { studentId, type: boostType, multiplier, expiresAt } });
      }
      const updated = await tx.studentGameProfile.update({ where: { studentId }, data: { books: profile.books - item.cost }, select: { books: true } });
      return updated.books;
    });
    return { ok: true, books, itemName: item.name };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha ao ativar boost." };
  }
}

export type ChestReward =
  | { kind: "books"; books: number }
  | { kind: "item"; itemName: string; rarity: string; type: string; payload: unknown }
  | { kind: "duplicate"; itemName: string; refund: number }
  | { kind: "boost"; itemName: string };

export type OpenChestResult =
  | { ok: true; reward: ChestReward; books: number }
  | { ok: false; error: string };

/** Abre um baú: gasta o custo, sorteia da loot table (ponderado) e concede. */
export async function openChest(chestId: string): Promise<OpenChestResult> {
  const studentId = await getCurrentStudentId();

  const chest = await prisma.rewardItem.findUnique({
    where: { id: chestId },
    include: { drops: { include: { item: true } } },
  });
  if (!chest || !chest.active || chest.type !== "CHEST") return { ok: false, error: "Baú indisponível." };
  if (chest.drops.length === 0) return { ok: false, error: "Baú vazio." };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.studentGameProfile.upsert({ where: { studentId }, create: { studentId }, update: {} });
      if (profile.level < chest.requiredLevel) throw new Error(`Requer nível ${chest.requiredLevel}.`);
      if (profile.books < chest.cost) throw new Error("Books insuficientes.");

      // Sorteio ponderado.
      const total = chest.drops.reduce((s, d) => s + d.weight, 0);
      let roll = Math.random() * total;
      const drop = chest.drops.find((d) => (roll -= d.weight) < 0) ?? chest.drops[0];

      let books = profile.books - chest.cost; // debita o custo
      let reward: ChestReward;

      if (!drop.itemId || !drop.item) {
        books += drop.books;
        reward = { kind: "books", books: drop.books };
      } else if (drop.item.type === "BOOST") {
        const p = payloadOf(drop.item.payload);
        const durationH = Number(p.durationH) || 24;
        const multiplier = Number(p.multiplier) || 2;
        const boostType = String(p.boostType || "DOUBLE_XP");
        const now = new Date();
        const active = await tx.studentBoost.findFirst({ where: { studentId, type: boostType, expiresAt: { gt: now } }, orderBy: { expiresAt: "desc" } });
        const baseT = active ? active.expiresAt : now;
        const expiresAt = new Date(baseT.getTime() + durationH * 3_600_000);
        if (active) await tx.studentBoost.update({ where: { id: active.id }, data: { expiresAt, multiplier } });
        else await tx.studentBoost.create({ data: { studentId, type: boostType, multiplier, expiresAt } });
        reward = { kind: "boost", itemName: drop.item.name };
      } else {
        // Cosmético: se já possui, devolve 25% do custo em books; senão concede.
        const owned = await tx.studentReward.findUnique({ where: { studentId_itemId: { studentId, itemId: drop.itemId } }, select: { studentId: true } });
        if (owned) {
          const refund = Math.max(1, Math.round(drop.item.cost * 0.25));
          books += refund;
          reward = { kind: "duplicate", itemName: drop.item.name, refund };
        } else {
          await tx.studentReward.create({ data: { studentId, itemId: drop.itemId } });
          reward = { kind: "item", itemName: drop.item.name, rarity: drop.item.rarity, type: drop.item.type, payload: drop.item.payload };
        }
      }

      const updated = await tx.studentGameProfile.update({ where: { studentId }, data: { books }, select: { books: true } });
      return { reward, books: updated.books };
    });

    return { ok: true, ...result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Falha ao abrir o baú." };
  }
}

/** Itens consumíveis/temporais para a loja: baús e boosts (com estado do aluno). */
export async function getChestsAndBoosts(): Promise<{
  books: number;
  level: number;
  chests: ShopItem[];
  boosts: ShopItem[];
  activeBoost: { multiplier: number; expiresAt: Date } | null;
}> {
  const studentId = await getCurrentStudentId();
  const [profile, items, active] = await Promise.all([
    prisma.studentGameProfile.findUnique({ where: { studentId }, select: { books: true, level: true } }),
    prisma.rewardItem.findMany({ where: { active: true, type: { in: ["CHEST", "BOOST"] } }, orderBy: [{ type: "asc" }, { cost: "asc" }] }),
    prisma.studentBoost.findFirst({ where: { studentId, type: "DOUBLE_XP", expiresAt: { gt: new Date() } }, orderBy: { expiresAt: "desc" } }),
  ]);
  const books = profile?.books ?? 0;
  const level = profile?.level ?? 1;
  const toShopItem = (it: (typeof items)[number]): ShopItem => ({
    id: it.id, code: it.code, type: it.type, name: it.name, description: it.description,
    rarity: it.rarity, cost: it.cost, requiredLevel: it.requiredLevel, payload: it.payload,
    featured: it.featured, owned: false, locked: level < it.requiredLevel, affordable: books >= it.cost,
  });
  return {
    books, level,
    chests: items.filter((i) => i.type === "CHEST").map(toShopItem),
    boosts: items.filter((i) => i.type === "BOOST").map(toShopItem),
    activeBoost: active ? { multiplier: active.multiplier, expiresAt: active.expiresAt } : null,
  };
}
