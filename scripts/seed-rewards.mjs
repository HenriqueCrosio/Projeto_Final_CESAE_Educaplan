// Seed idempotente do catálogo da loja (G2a). Corre com:
//   set -a; . ./.env.local; set +a; node scripts/seed-rewards.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Catálogo inicial — assets procedurais (sem ficheiros). */
const ITEMS = [
  // ── Badges (ícone Lucide + cor; moldura vem da raridade) ──
  { code: "badge_flame", type: "BADGE", name: "Chama de Estudo", description: "Mantém o ritmo aceso.", rarity: "COMMON", cost: 40, requiredLevel: 1, payload: { icon: "Flame", color: "#f97316" } },
  { code: "badge_star", type: "BADGE", name: "Estrela", description: "Brilha entre os colegas.", rarity: "COMMON", cost: 40, requiredLevel: 1, payload: { icon: "Star", color: "#eab308" } },
  { code: "badge_book", type: "BADGE", name: "Rato de Biblioteca", description: "Devorador de materiais.", rarity: "RARE", cost: 90, requiredLevel: 2, payload: { icon: "BookOpen", color: "#3b82f6" } },
  { code: "badge_brain", type: "BADGE", name: "Mente Brilhante", description: "Pensamento afiado.", rarity: "RARE", cost: 90, requiredLevel: 2, payload: { icon: "Brain", color: "#8b5cf6" } },
  { code: "badge_target", type: "BADGE", name: "Pontaria", description: "Acertas em cheio.", rarity: "RARE", cost: 90, requiredLevel: 3, payload: { icon: "Target", color: "#ef4444" } },
  { code: "badge_rocket", type: "BADGE", name: "Foguetão", description: "A subir de nível sem parar.", rarity: "EPIC", cost: 180, requiredLevel: 4, payload: { icon: "Rocket", color: "#06b6d4" } },
  { code: "badge_crown", type: "BADGE", name: "Coroa", description: "Realeza dos estudos.", rarity: "EPIC", cost: 180, requiredLevel: 5, payload: { icon: "Crown", color: "#f59e0b" } },
  { code: "badge_gem", type: "BADGE", name: "Gema Rara", description: "Uma joia entre os alunos.", rarity: "LEGENDARY", cost: 350, requiredLevel: 7, featured: true, payload: { icon: "Gem", color: "#10b981" } },

  // ── Paletas (cores aplicadas aos cards do Hub) ──
  { code: "palette_pastel", type: "PALETTE", name: "Pastel", description: "Tons suaves e calmos.", rarity: "RARE", cost: 60, requiredLevel: 1, payload: { border: "#fbcfe8", bg: "#fdf2f8", accent: "#ec4899" } },
  { code: "palette_ocean", type: "PALETTE", name: "Oceano", description: "Azuis frescos.", rarity: "RARE", cost: 60, requiredLevel: 2, payload: { border: "#bae6fd", bg: "#f0f9ff", accent: "#0ea5e9" } },
  { code: "palette_forest", type: "PALETTE", name: "Floresta", description: "Verdes vivos.", rarity: "EPIC", cost: 120, requiredLevel: 3, payload: { border: "#bbf7d0", bg: "#f0fdf4", accent: "#22c55e" } },
  { code: "palette_metal", type: "PALETTE", name: "Metálico", description: "Acabamento premium.", rarity: "LEGENDARY", cost: 200, requiredLevel: 5, payload: { border: "#cbd5e1", bg: "#f8fafc", accent: "#64748b" } },

  // ── Banners (gradiente CSS para o cartão do Hub) ──
  { code: "banner_sunset", type: "BANNER", name: "Pôr do Sol", description: "Quente e vibrante.", rarity: "RARE", cost: 90, requiredLevel: 2, payload: { gradient: "linear-gradient(135deg,#f97316,#ef4444,#ec4899)" } },
  { code: "banner_aurora", type: "BANNER", name: "Aurora", description: "Luzes do norte.", rarity: "EPIC", cost: 90, requiredLevel: 2, featured: true, payload: { gradient: "linear-gradient(135deg,#6366f1,#a855f7,#ec4899)" } },
  { code: "banner_mint", type: "BANNER", name: "Menta", description: "Fresco e luminoso.", rarity: "LEGENDARY", cost: 180, requiredLevel: 4, payload: { gradient: "linear-gradient(135deg,#10b981,#06b6d4,#3b82f6)" } },
];

let created = 0;
for (const it of ITEMS) {
  await prisma.rewardItem.upsert({
    where: { code: it.code },
    create: it,
    update: {
      type: it.type,
      name: it.name,
      description: it.description,
      rarity: it.rarity,
      cost: it.cost,
      requiredLevel: it.requiredLevel,
      featured: it.featured ?? false,
      payload: it.payload,
      active: true,
    },
  });
  created += 1;
}

console.log(`Seed concluído: ${created} itens (upsert por code).`);
await prisma.$disconnect();
