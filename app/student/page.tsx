import { getSession } from "@auth0/nextjs-auth0";
import { getMyClasses } from "@/actions/student-view.actions";

export const dynamic = "force-dynamic";

function teacherName(teacher: {
  user: { profile: { displayName: string | null } | null; email: string };
} | null): string | null {
  if (!teacher) return null;
  return teacher.user.profile?.displayName || teacher.user.email || null;
}

export default async function StudentHome() {
  const session = await getSession();
  const name = session?.user?.name || session?.user?.email || "aluno";
  const classes = await getMyClasses();

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] w-full bg-muted/30 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Olá, {name} 👋</h1>
          <a
            href="/api/auth/logout"
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            Sair
          </a>
        </div>

        <h2 className="text-xl font-semibold mb-4">As minhas turmas</h2>

        {classes.length === 0 ? (
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-muted-foreground">
              Ainda não estás em nenhuma turma. Quando um professor te adicionar com este email,
              as tuas turmas, aulas e materiais aparecem aqui.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {classes.map((c) => {
              const tName = teacherName(c.teacher);
              return (
                <a
                  key={c.id}
                  href={`/student/turmas/${c.id}`}
                  className="group block rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md hover:border-primary/40"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1 h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: c.color || "#94a3b8" }}
                    />
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold group-hover:text-primary">{c.name}</h3>
                      <p className="truncate text-sm text-muted-foreground">{c.course.name}</p>
                      {tName && (
                        <p className="mt-2 truncate text-xs text-muted-foreground/70">Professor: {tName}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        {c._count.students} aluno(s) · {c._count.schedules} aula(s) marcada(s)
                      </p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
