import { notFound } from "next/navigation";
import { getMyClassDetail } from "@/actions/student-view.actions";
import { MarkButton } from "@/components/student/mark-button";

export const dynamic = "force-dynamic";

const dtf = new Intl.DateTimeFormat("pt-PT", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const df = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", year: "numeric" });

const EXAM_TYPE_LABEL: Record<string, string> = {
  QUIZ: "Quiz",
  MIDTERM: "Teste intermédio",
  FINAL: "Exame final",
  PRACTICE: "Prática",
};

export default async function StudentClassDetail({
  params,
}: {
  params: { classId: string };
}) {
  const detail = await getMyClassDetail(params.classId);
  if (!detail) notFound();

  const { class: klass, schedules, exams, materials } = detail;
  const now = Date.now();

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] w-full bg-muted/20 p-6 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <a href="/student/turmas" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
          ← As minhas turmas
        </a>

        <div className="mt-3 mb-8 flex items-center gap-3">
          <span
            className="h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: klass.color || "#94a3b8" }}
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{klass.name}</h1>
            <p className="text-muted-foreground">{klass.course.name}</p>
          </div>
        </div>

        {/* Agenda */}
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Agenda</h2>
          {schedules.length === 0 ? (
            <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground shadow-sm">
              Ainda não há aulas marcadas para esta turma.
            </p>
          ) : (
            <ul className="space-y-2">
              {schedules.map((s) => {
                const start = new Date(s.dateTime);
                const past = start.getTime() + s.duration * 60000 < now;
                return (
                  <li
                    key={s.id}
                    className={`rounded-xl border bg-card p-4 shadow-sm ${past ? "opacity-80" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.lesson.name}</p>
                        <p className="truncate text-xs text-muted-foreground/70">{s.lesson.module.name}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {past && <MarkButton kind="lesson" id={s.id} done={s.done} />}
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{dtf.format(start)}</p>
                          <p className="text-xs text-muted-foreground/70">{s.duration} min</p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Exames */}
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Exames</h2>
          {exams.length === 0 ? (
            <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground shadow-sm">
              Sem exames para esta turma.
            </p>
          ) : (
            <ul className="space-y-2">
              {exams.map((e) => {
                const sub = e.submissions[0];
                const badge =
                  sub?.status === "GRADED"
                    ? { label: `Avaliado · ${sub.score ?? 0} pts`, cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" }
                    : sub?.status
                    ? { label: "Submetido", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" }
                    : { label: "Por fazer", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" };
                return (
                  <li key={e.id} className="rounded-xl border bg-card shadow-sm transition hover:border-primary/40 hover:shadow">
                    <a href={`/student/exames/${e.id}`} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{e.name}</p>
                        <p className="truncate text-xs text-muted-foreground/70">
                          {EXAM_TYPE_LABEL[e.type] ?? e.type} · {e.module.name}
                        </p>
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="shrink-0 text-right text-sm text-muted-foreground">
                        <p>{df.format(new Date(e.date))}</p>
                        <p className="text-xs text-muted-foreground/70">
                          {e.duration} min · {e.maxScore} pts
                        </p>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Materiais */}
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Materiais</h2>
          {materials.length === 0 ? (
            <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground shadow-sm">
              Sem materiais disponíveis.
            </p>
          ) : (
            <ul className="space-y-2">
              {materials.map((m) => {
                const scope = m.topic?.name || m.module?.name || "Curso";
                return (
                  <li key={m.id} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{m.name}</p>
                        {m.description && (
                          <p className="truncate text-xs text-muted-foreground">{m.description}</p>
                        )}
                        <p className="truncate text-xs text-muted-foreground/70">{scope}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <MarkButton kind="material" id={m.id} done={m.done} />
                        {m.url && (
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border px-3 py-1.5 text-sm text-primary hover:bg-accent"
                          >
                            Abrir
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
