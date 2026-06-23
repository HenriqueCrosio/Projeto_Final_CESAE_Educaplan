import Link from "next/link";
import { getStudentHomeSummary } from "@/actions/student-view.actions";
import { getMyGameProfile, recordDailyCheckin } from "@/actions/gamification.actions";
import {
  GraduationCap,
  ClipboardList,
  Clock,
  CheckCircle2,
  Trophy,
  Flame,
  ArrowRight,
  CalendarDays,
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null): string {
  if (!date) return "Sem data";
  return new Date(date).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tint}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-2xl font-bold leading-none">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default async function StudentHome() {
  // Check-in diário (idempotente) ANTES de ler o perfil, para refletir hoje.
  await recordDailyCheckin();
  const [summary, game] = await Promise.all([
    getStudentHomeSummary(),
    getMyGameProfile(),
  ]);

  const levelPct = game.levelNeeded
    ? Math.min(100, Math.round((game.levelInto / game.levelNeeded) * 100))
    : 0;

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-bold tracking-tight">Olá, {summary.displayName} 👋</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Bem-vindo ao teu espaço. Aqui tens tudo num só lugar.
      </p>

      {/* Faixa de gamificação (dados reais) */}
      <div className="mt-6 rounded-xl border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Trophy className="h-6 w-6" />
          </span>
          <div className="min-w-[10rem] flex-1">
            <div className="font-semibold">
              Nível {game.level} · {game.xp} XP
            </div>
            <div className="text-xs text-muted-foreground">
              {game.levelNeeded - game.levelInto} XP para o nível {game.level + 1}
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm shadow-sm">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-medium">{game.books}</span>
            <span className="text-muted-foreground">books</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm shadow-sm">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-medium">{game.currentStreak}</span>
            <span className="text-muted-foreground">
              {game.currentStreak === 1 ? "dia seguido" : "dias seguidos"}
            </span>
          </div>
        </div>
        {/* Barra de progresso para o próximo nível */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-primary/10">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${levelPct}%` }} />
        </div>
      </div>

      {/* Resumo */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Turmas" value={summary.classCount} tint="bg-primary/10 text-primary" />
        <StatCard icon={ClipboardList} label="Exames por fazer" value={summary.todo} tint="bg-blue-500/10 text-blue-500" />
        <StatCard icon={Clock} label="A aguardar nota" value={summary.inProgress} tint="bg-amber-500/10 text-amber-500" />
        <StatCard icon={CheckCircle2} label="Avaliados" value={summary.graded} tint="bg-emerald-500/10 text-emerald-500" />
      </div>

      {/* Próximos exames */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Próximos exames</h2>
        </div>
        {summary.upcoming.length === 0 ? (
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
            Não tens exames por fazer. 🎉
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border bg-card shadow-sm">
            {summary.upcoming.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/student/exames/${e.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{e.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {e.course ?? "—"} · {formatDate(e.date)}
                      {e.maxScore ? ` · ${e.maxScore} pts` : ""}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Atalho para turmas */}
      <div className="mt-8">
        <Link
          href="/student/turmas"
          className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Ver as minhas turmas
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
