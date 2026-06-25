"use client";

import { useEffect, useState } from "react";
import { getSubmissionsForGrading } from "@/actions/grading.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Row = Awaited<ReturnType<typeof getSubmissionsForGrading>>[number];

const df = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const STATUS: Record<string, { label: string; cls: string }> = {
  IN_PROGRESS: { label: "Em curso", cls: "bg-gray-100 text-gray-700" },
  SUBMITTED: { label: "A aguardar correção", cls: "bg-amber-100 text-amber-800" },
  GRADED: { label: "Avaliado", cls: "bg-green-100 text-green-800" },
};

export default function CorrecoesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubmissionsForGrading()
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  const pending = rows.filter((r) => r.status === "SUBMITTED");
  const done = rows.filter((r) => r.status !== "SUBMITTED");

  const renderRow = (r: Row) => {
    const st = STATUS[r.status] ?? STATUS.SUBMITTED;
    return (
      <li key={r.id} className="rounded-xl border bg-card shadow-sm transition hover:border-primary/40 hover:shadow">
        <a href={`/dashboard/correcoes/${r.id}`} className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate font-medium">{r.exam.name}</p>
            <p className="truncate text-xs text-gray-500">
              {r.studentName} · {r.studentNumber} · {r.answerCount} respostas
            </p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>
              {st.label}
              {r.status === "GRADED" && r.score != null ? ` · ${r.score} pts` : ""}
            </span>
          </div>
          <div className="shrink-0 text-right text-xs text-gray-400">
            {r.submittedAt ? df.format(new Date(r.submittedAt)) : "—"}
          </div>
        </a>
      </li>
    );
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Correções</h1>

      {loading ? (
        <p className="text-gray-500">A carregar...</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-500">Ainda não há submissões de alunos.</p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>A aguardar correção ({pending.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pending.length === 0 ? (
                <p className="text-gray-500">Nada por corrigir.</p>
              ) : (
                <ul className="space-y-2">{pending.map(renderRow)}</ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avaliadas ({done.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {done.length === 0 ? (
                <p className="text-gray-500">Sem submissões avaliadas.</p>
              ) : (
                <ul className="space-y-2">{done.map(renderRow)}</ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
