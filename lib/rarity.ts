// ── Raridade: fonte ÚNICA de verdade para moldura + brilho + etiqueta ──
// Mapa de cores pedido pelo usuário (e des-roxando o épico, alinhado à marca âmbar):
//   comum = cinza · raro = azul · épico = vermelho · lendário = dourado (glow forte)
// Lendário usa um glow forte (não só a cor) para se DESTACAR do âmbar plano da
// interface — senão fundia-se com a cor de marca. Usado na loja, na coleção (hub),
// nos baús e boosts, para consistência total.

export type RarityKey = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface RarityStyle {
  label: string;
  /** anel/borda da moldura (usar com ring-2) */
  ring: string;
  /** brilho exterior (vazio no comum) */
  glow: string;
  /** etiqueta/chip da raridade */
  chip: string;
  /** ordem para ordenar do mais comum ao mais raro */
  order: number;
}

export const RARITY: Record<string, RarityStyle> = {
  COMMON: {
    label: "Comum",
    ring: "ring-slate-300 dark:ring-slate-600",
    glow: "",
    chip: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    order: 0,
  },
  RARE: {
    label: "Raro",
    ring: "ring-blue-500 dark:ring-blue-400",
    glow: "shadow-[0_0_22px_-6px_rgba(59,130,246,0.75)]",
    chip: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    order: 1,
  },
  EPIC: {
    label: "Épico",
    ring: "ring-red-500 dark:ring-red-400",
    glow: "shadow-[0_0_26px_-5px_rgba(239,68,68,0.8)]",
    chip: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    order: 2,
  },
  LEGENDARY: {
    label: "Lendário",
    ring: "ring-amber-400 dark:ring-amber-300",
    glow: "shadow-[0_0_34px_-2px_rgba(245,158,11,0.95)]",
    chip: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    order: 3,
  },
};

/** Estilo de uma raridade, com fallback seguro para comum. */
export function rarityOf(rarity: string): RarityStyle {
  return RARITY[rarity] ?? RARITY.COMMON;
}
