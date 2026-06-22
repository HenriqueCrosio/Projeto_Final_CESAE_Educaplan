import { notFound } from "next/navigation";
import { getMyClassDetail } from "@/actions/student-view.actions";

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
    <div className="min-h-screen w-full bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <a href="/student" className="text-sm text-gray-500 hover:underline">
          ← As minhas turmas
        </a>

        <div className="mt-3 mb-8 flex items-center gap-3">
          <span
            className="h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: klass.color || "#94a3b8" }}
          />
          <div>
            <h1 className="text-2xl font-bold">{klass.name}</h1>
            <p className="text-gray-600">{klass.course.name}</p>
          </div>
        </div>

        {/* Agenda */}
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Agenda</h2>
          {schedules.length === 0 ? (
            <p className="rounded-xl border bg-white p-5 text-sm text-gray-500 shadow-sm">
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
                    className={`rounded-xl border bg-white p-4 shadow-sm ${
                      past ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.lesson.name}</p>
                        <p className="truncate text-xs text-gray-400">{s.lesson.module.name}</p>
                      </div>
                      <div className="shrink-0 text-right text-sm text-gray-600">
                        <p>{dtf.format(start)}</p>
                        <p className="text-xs text-gray-400">{s.duration} min</p>
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
            <p className="rounded-xl border bg-white p-5 text-sm text-gray-500 shadow-sm">
              Sem exames para esta turma.
            </p>
          ) : (
            <ul className="space-y-2">
              {exams.map((e) => {
                const sub = e.submissions[0];
                const badge =
                  sub?.status === "GRADED"
                    ? { label: `Avaliado · ${sub.score ?? 0} pts`, cls: "bg-green-100 text-green-800" }
                    : sub?.status
                    ? { label: "Submetido", cls: "bg-amber-100 text-amber-800" }
                    : { label: "Por fazer", cls: "bg-blue-100 text-blue-800" };
                return (
                  <li key={e.id} className="rounded-xl border bg-white shadow-sm transition hover:border-blue-300 hover:shadow">
                    <a href={`/student/exames/${e.id}`} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{e.name}</p>
                        <p className="truncate text-xs text-gray-400">
                          {EXAM_TYPE_LABEL[e.type] ?? e.type} · {e.module.name}
                        </p>
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="shrink-0 text-right text-sm text-gray-600">
                        <p>{df.format(new Date(e.date))}</p>
                        <p className="text-xs text-gray-400">
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
            <p className="rounded-xl border bg-white p-5 text-sm text-gray-500 shadow-sm">
              Sem materiais disponíveis.
            </p>
          ) : (
            <ul className="space-y-2">
              {materials.map((m) => {
                const scope = m.topic?.name || m.module?.name || "Curso";
                return (
                  <li key={m.id} className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{m.name}</p>
                        {m.description && (
                          <p className="truncate text-xs text-gray-500">{m.description}</p>
                        )}
                        <p className="truncate text-xs text-gray-400">{scope}</p>
                      </div>
                      {m.url && (
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-lg border px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
                        >
                          Abrir
                        </a>
                      )}
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
