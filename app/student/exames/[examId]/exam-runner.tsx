"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getExamForTaking, submitExam } from "@/actions/submission.actions";

type Data = NonNullable<Awaited<ReturnType<typeof getExamForTaking>>>;
type Exercise = Data["exam"]["exercises"][number]["exercise"];

const isAutoType = (type: string) => type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE";

const TYPE_LABEL: Record<string, string> = {
  MULTIPLE_CHOICE: "Escolha múltipla",
  TRUE_FALSE: "Verdadeiro / Falso",
  SHORT_ANSWER: "Resposta curta",
  LONG_ANSWER: "Resposta longa",
  CODE: "Código",
  FILE_UPLOAD: "Ficheiro",
};

export function ExamRunner({ data }: { data: Data }) {
  const { exam, submission, totalPoints } = data;
  const router = useRouter();

  const [selected, setSelected] = useState<Record<string, string>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const courseName = exam.module.course.name;

  const handleSubmit = async () => {
    if (!confirm("Submeter o exame? Não poderá alterar as respostas depois.")) return;
    setSubmitting(true);
    try {
      await submitExam(
        exam.id,
        exam.exercises.map(({ exercise }) => ({
          exerciseId: exercise.id,
          selectedOptionId: isAutoType(exercise.type) ? selected[exercise.id] ?? null : null,
          responseText: isAutoType(exercise.type) ? null : texts[exercise.id] ?? null,
        }))
      );
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao submeter o exame.");
      setSubmitting(false);
    }
  };

  // Mapa de respostas já submetidas (modo resultado).
  const answerByExercise = submission
    ? new Map(submission.answers.map((a) => [a.exerciseId, a]))
    : null;

  const optionText = (exercise: Exercise, optionId: string | null) =>
    optionId ? exercise.options.find((o) => o.id === optionId)?.text ?? "—" : "—";

  return (
    <div className="min-h-screen w-full bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:underline">
          ← Voltar
        </button>

        <div className="mt-3 mb-6">
          <h1 className="text-2xl font-bold">{exam.name}</h1>
          <p className="text-gray-600">
            {courseName} · {exam.module.name}
          </p>
          {exam.description && <p className="mt-2 text-sm text-gray-500">{exam.description}</p>}
          <p className="mt-2 text-xs text-gray-400">
            {exam.duration} min · {totalPoints} pts no total
          </p>
        </div>

        {/* Banner de estado da submissão */}
        {submission && (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm ${
              submission.status === "GRADED"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {submission.status === "GRADED" ? (
              <p className="font-medium">
                Avaliado · {submission.score ?? 0} / {totalPoints} pts
              </p>
            ) : (
              <p className="font-medium">Submetido — a aguardar correção do professor.</p>
            )}
          </div>
        )}

        {exam.exercises.length === 0 ? (
          <p className="rounded-xl border bg-white p-5 text-sm text-gray-500 shadow-sm">
            Este exame ainda não tem perguntas.
          </p>
        ) : (
          <ol className="space-y-4">
            {exam.exercises.map(({ exercise }, idx) => {
              const ans = answerByExercise?.get(exercise.id);
              return (
                <li key={exercise.id} className="rounded-xl border bg-white p-5 shadow-sm">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <p className="font-medium">
                      {idx + 1}. {exercise.title}
                    </p>
                    <span className="shrink-0 text-xs text-gray-400">
                      {TYPE_LABEL[exercise.type] ?? exercise.type} · {exercise.points} pts
                    </span>
                  </div>
                  <p className="mb-3 whitespace-pre-wrap text-sm text-gray-700">{exercise.content}</p>

                  {/* MODO RESULTADO */}
                  {submission ? (
                    <div className="space-y-1 text-sm">
                      {isAutoType(exercise.type) ? (
                        <p>
                          <span className="text-gray-500">Resposta: </span>
                          {optionText(exercise, ans?.selectedOptionId ?? null)}
                        </p>
                      ) : (
                        <p className="whitespace-pre-wrap">
                          <span className="text-gray-500">Resposta: </span>
                          {ans?.responseText || "—"}
                        </p>
                      )}
                      {ans?.isCorrect != null && (
                        <p className={ans.isCorrect ? "text-green-700" : "text-red-600"}>
                          {ans.isCorrect ? "✓ Correta" : "✗ Incorreta"} · {ans.pointsAwarded ?? 0} pts
                        </p>
                      )}
                      {ans?.isCorrect == null && ans?.pointsAwarded != null && (
                        <p className="text-gray-700">Nota: {ans.pointsAwarded} pts</p>
                      )}
                      {ans?.isCorrect == null && ans?.pointsAwarded == null && submission.status !== "GRADED" && (
                        <p className="text-amber-600">Aguarda correção manual</p>
                      )}
                      {ans?.feedback && (
                        <p className="text-gray-600">
                          <span className="text-gray-500">Feedback: </span>
                          {ans.feedback}
                        </p>
                      )}
                    </div>
                  ) : (
                    /* MODO RESPOSTA */
                    <div className="space-y-2">
                      {isAutoType(exercise.type) ? (
                        exercise.options.length === 0 ? (
                          <p className="text-xs text-amber-600">
                            Sem opções definidas para esta pergunta.
                          </p>
                        ) : (
                          exercise.options.map((opt) => (
                            <label key={opt.id} className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name={exercise.id}
                                checked={selected[exercise.id] === opt.id}
                                onChange={() => setSelected((s) => ({ ...s, [exercise.id]: opt.id }))}
                              />
                              {opt.text}
                            </label>
                          ))
                        )
                      ) : (
                        <textarea
                          value={texts[exercise.id] ?? ""}
                          onChange={(e) => setTexts((t) => ({ ...t, [exercise.id]: e.target.value }))}
                          className="min-h-24 w-full rounded border p-2 text-sm"
                          placeholder="A tua resposta..."
                        />
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {!submission && exam.exercises.length > 0 && (
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "A submeter..." : "Submeter exame"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
