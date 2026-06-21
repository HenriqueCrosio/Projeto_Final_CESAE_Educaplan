"use client";

import { useState } from "react";
import { completeTeacherOnboarding, completeStudentOnboarding } from "@/actions/organization.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Persona = "teacher" | "student" | null;

export default function OnboardingPage() {
  const [persona, setPersona] = useState<Persona>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res =
        persona === "teacher"
          ? await completeTeacherOnboarding(name)
          : await completeStudentOnboarding(name);
      // Navegação completa para o middleware ler a sessão atualizada.
      window.location.href = res.redirectTo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao guardar.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-md rounded-xl border bg-white dark:bg-neutral-900 p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Educaplan 👋</h1>

        {persona === null && (
          <>
            <p className="text-neutral-500 mb-6">Como vais usar o Educaplan?</p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => setPersona("teacher")} className="h-auto py-4 flex flex-col items-start">
                <span className="font-semibold">Sou professor / instituição</span>
                <span className="text-xs opacity-80">Criar cursos, turmas e gerir alunos</span>
              </Button>
              <Button
                onClick={() => setPersona("student")}
                variant="outline"
                className="h-auto py-4 flex flex-col items-start"
              >
                <span className="font-semibold">Sou aluno</span>
                <span className="text-xs opacity-80">Estudar e juntar-me a turmas</span>
              </Button>
            </div>
          </>
        )}

        {persona === "teacher" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-neutral-500">Vamos criar o teu espaço. Como se chama a tua organização?</p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="orgName">Nome da organização</Label>
              <Input
                id="orgName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Escola de Programação ACME"
                autoFocus
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setPersona(null)}>Voltar</Button>
              <Button type="submit" disabled={loading || !name.trim()} className="flex-1">
                {loading ? "A criar…" : "Criar e continuar"}
              </Button>
            </div>
          </form>
        )}

        {persona === "student" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-neutral-500">Como te chamas?</p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="displayName">O teu nome</Label>
              <Input
                id="displayName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Maria Silva"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setPersona(null)}>Voltar</Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "A entrar…" : "Entrar no Educaplan"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
