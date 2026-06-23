import { getMyGameProfile } from "@/actions/gamification.actions";
import { BookOpen, Trophy, Gift, Palette, Image as ImageIcon, Package, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

// Vitrine ilustrativa (G2 ainda por implementar — sem compra real).
const SHOP_TEASER = [
  { icon: Palette, name: "Paleta Pastel", cost: 60, desc: "Tons suaves para os teus cards" },
  { icon: Palette, name: "Paleta Metálica", cost: 120, desc: "Acabamento metálico premium" },
  { icon: ImageIcon, name: "Banner Aurora", cost: 90, desc: "Gradiente animado para o teu Hub" },
  { icon: Package, name: "Baú Misterioso", cost: 40, desc: "Recompensa aleatória: badge, banner ou boost" },
];

export default async function RecompensasPage() {
  const game = await getMyGameProfile();
  const levelPct = game.levelNeeded
    ? Math.min(100, Math.round((game.levelInto / game.levelNeeded) * 100))
    : 0;

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-bold tracking-tight">Recompensas</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ganha <strong>books</strong> 📚 a estudar e troca-os por personalização. O XP marca o teu nível — e nunca se perde.
      </p>

      {/* Saldo / nível atual (real) */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4 text-primary" /> Nível
          </div>
          <div className="mt-1 text-3xl font-bold">{game.level}</div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-primary/10">
            <div className="h-full rounded-full bg-primary" style={{ width: `${levelPct}%` }} />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {game.levelNeeded - game.levelInto} XP para o nível {game.level + 1}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4 text-primary" /> Books disponíveis
          </div>
          <div className="mt-1 text-3xl font-bold">{game.books}</div>
          <div className="mt-2 text-xs text-muted-foreground">A tua moeda para a loja</div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gift className="h-4 w-4 text-primary" /> XP total
          </div>
          <div className="mt-1 text-3xl font-bold">{game.xp}</div>
          <div className="mt-2 text-xs text-muted-foreground">Conquista permanente</div>
        </div>
      </div>

      {/* Loja (teaser — G2) */}
      <div className="mt-8 flex items-center gap-2">
        <h2 className="text-lg font-semibold">Loja</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">em breve</span>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHOP_TEASER.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm opacity-80"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </span>
            <div className="mt-3 font-medium">{item.name}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{item.desc}</div>
            <div className="mt-3 flex items-center gap-1.5 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-primary" /> {item.cost}
            </div>
            <div className="absolute right-3 top-3 text-muted-foreground/60">
              <Lock className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Em breve poderás abrir <strong>baús</strong>, desbloquear <strong>badges</strong> e <strong>cores</strong>, e
        equipar tudo no teu <strong>Hub de Estudos</strong>.
      </p>
    </div>
  );
}
