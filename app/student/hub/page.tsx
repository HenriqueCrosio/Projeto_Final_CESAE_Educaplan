import { getMyGameProfile } from "@/actions/gamification.actions";
import { getStudentHomeSummary } from "@/actions/student-view.actions";
import { Palette, Image as ImageIcon, Award, Sparkles, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentHubPage() {
  const [game, summary] = await Promise.all([getMyGameProfile(), getStudentHomeSummary()]);

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-bold tracking-tight">Hub de Estudos</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        O teu espaço pessoal. Em breve vais poder personalizá-lo com o que desbloqueares na loja.
      </p>

      {/* Preview do cartão pessoal (banner + identidade) */}
      <div className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="relative h-32 bg-gradient-to-r from-primary/30 via-primary/15 to-transparent">
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/70 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
            <Lock className="h-3 w-3" /> banner em breve
          </span>
        </div>
        <div className="flex items-end gap-4 p-5">
          <div className="-mt-12 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-card bg-primary text-2xl font-bold text-primary-foreground">
            {summary.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="pb-1">
            <div className="font-semibold">{summary.displayName}</div>
            <div className="text-xs text-muted-foreground">Nível {game.level} · {game.xp} XP · {game.books} books</div>
          </div>
        </div>
      </div>

      {/* O que vais poder personalizar */}
      <h2 className="mt-8 text-lg font-semibold">Personalização (em breve)</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        {[
          { icon: ImageIcon, name: "Banner", desc: "Escolhe um banner desbloqueado na loja" },
          { icon: Palette, name: "Cores dos cards", desc: "Bordas e fundo com as tuas paletas" },
          { icon: Award, name: "Badges favoritas", desc: "Destaca os emblemas que conquistaste" },
        ].map((f) => (
          <div key={f.name} className="rounded-xl border border-dashed bg-muted/20 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <f.icon className="h-5 w-5" />
            </span>
            <div className="mt-3 font-medium">{f.name}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-xl border bg-primary/5 p-4 text-sm">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-muted-foreground">
          Ganha <strong>books</strong> a estudar, desbloqueia itens em <strong>Recompensas</strong> e equipa-os aqui.
        </span>
      </div>
    </div>
  );
}
