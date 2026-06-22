"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gradeSubmission, getSubmissionForGrading, type GradeItemInput } from "@/actions/grading.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Submission = NonNullable<Awaited<ReturnType<typeof getSubmissionForGrading>>>;
type Answer = Submission["answers"][number];

const isAutoType = (type: string) => type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE";

export function GradingForm({ submission }: { submission: Submission }) {
  const router = useRouter();
  const [points, setPoints] = useState<Record<string, string>>(
    Object.fromEntries(submission.answers.map((a) => [a.id, a.pointsAwarded?.toString() ?? ""]))
  );
  const [feedback, setFeedback] = useState<Record<string, string>>(
    Object.fromEntries(submission.answers.map((a) => [a.id, a.feedback ?? ""]))
  );
  const [saving, setSaving] = useState(false);

  const liveScore = submission.answers.reduce((s, a) => {
    const v = Number(points[a.id]);
    return s + (points[a.id] !== "" && !Number.isNaN(v) ? v : 0);
  }, 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const items: GradeItemInput[] = submission.answers.map((a) => {
        const raw = points[a.id];
        return {
          answerId: a.id,
          pointsAwarded: raw === "" ? null : Number(raw),
          // Preserva o resultado auto (MC/TF); manuais ficam sem isCorrect.
          isCorrect: isAutoType(a.exercise.type) ? a.isCorrect : null,
          feedback: feedback[a.id] || null,
        };
      });
      await gradeSubmission(submission.id, items);
      router.refresh();
      alert("Submissão avaliada.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao gravar a correção.");
    } finally {
      setSaving(false);
    }
  };

  const selectedText = (a: Answer) =>
    a.selectedOptionId ? a.exercise.options.find((o) => o.id === a.selectedOptionId)?.text ?? "—" : "—";

  return (
    <div className="min-h-screen w-full bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <a href="/dashboard/correcoes" className="text-sm text-gray-500 hover:underline">
          ← Correções
        </a>

        <div className="mt-3 mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{submission.exam.name}</h1>
            <p className="text-gray-600">
              {submission.studentName} · {submission.studentNumber}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm text-gray-500">
              {submission.status === "GRADED" ? "Avaliado" : "A aguardar correção"}
            </p>
            <p className="text-lg font-semibold">
              {liveScore} / {submission.totalPoints} pts
            </p>
          </div>
        </div>

        <ol className="space-y-4">
          {submission.answers.map((a, idx) => {
            const auto = isAutoType(a.exercise.type);
            const correctOption = a.exercise.options.find((o) => o.isCorrect);
            return (
              <li key={a.id} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="font-medium">
                    {idx + 1}. {a.exercise.title}
                  </p>
                  <span className="shrink-0 text-xs text-gray-400">máx. {a.exercise.points} pts</span>
                </div>
                <p className="mb-3 whitespace-pre-wrap text-sm text-gray-700">{a.exercise.content}</p>

                {auto ? (
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Resposta do aluno: </span>
                      {selectedText(a)}
                      {a.isCorrect != null && (
                        <span className={a.isCorrect ? "text-green-700" : "text-red-600"}>
                          {" "}
                          {a.isCorrect ? "✓ correta" : "✗ incorreta"}
                        </span>
                      )}
                    </p>
                    {correctOption && (
                      <p className="text-xs text-gray-400">Gabarito: {correctOption.text}</p>
                    )}
                  </div>
                ) : (
                  <div className="rounded border bg-gray-50 p-3 text-sm">
                    <p className="mb-1 text-xs text-gray-500">Resposta do aluno:</p>
                    <p className="whitespace-pre-wrap">{a.responseText || "— (sem resposta)"}</p>
                  </div>
                )}

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[120px_1fr]">
                  <div>
                    <label className="text-xs text-gray-500">Pontos</label>
                    <Input
                      type="number"
                      min={0}
                      max={a.exercise.points}
                      value={points[a.id]}
                      onChange={(e) => setPoints((p) => ({ ...p, [a.id]: e.target.value }))}
                      placeholder={auto ? undefined : "—"}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Feedback (opcional)</label>
                    <Input
                      value={feedback[a.id]}
                      onChange={(e) => setFeedback((f) => ({ ...f, [a.id]: e.target.value }))}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "A gravar..." : submission.status === "GRADED" ? "Atualizar correção" : "Finalizar correção"}
          </Button>
          <span className="text-sm text-gray-500">
            Total: {liveScore} / {submission.totalPoints} pts
          </span>
        </div>
      </div>
    </div>
  );
}
