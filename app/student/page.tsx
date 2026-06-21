import { getSession } from "@auth0/nextjs-auth0";

export const dynamic = "force-dynamic";

export default async function StudentHome() {
  const session = await getSession();
  const name = session?.user?.name || session?.user?.email || "aluno";

  return (
    <div className="min-h-screen w-full bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Olá, {name} 👋</h1>
          <a href="/api/auth/logout" className="text-sm text-gray-600 hover:underline">
            Sair
          </a>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">A tua área de aluno</h2>
          <p className="text-gray-600">
            Ainda não estás em nenhuma turma. Quando um professor te adicionar com este email,
            as tuas turmas, aulas e materiais aparecem aqui.
          </p>
          <p className="text-gray-400 text-sm mt-4">
            (Dashboard pessoal, materiais e progresso chegam nos próximos passos.)
          </p>
        </div>
      </div>
    </div>
  );
}
