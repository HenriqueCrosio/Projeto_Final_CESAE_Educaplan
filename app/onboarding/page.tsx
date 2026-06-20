"use client";

import { useState } from "react";
import { completeOnboarding } from "@/actions/organization.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await completeOnboarding(name);
      // Recarrega via navegação completa para que o middleware leia a sessão atualizada.
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao guardar.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-md rounded-xl border bg-white dark:bg-neutral-900 p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Educaplan 👋</h1>
        <p className="text-neutral-500 mb-6">
          Vamos criar o teu espaço de trabalho. Como se chama a tua organização?
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? "A criar…" : "Criar e continuar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
