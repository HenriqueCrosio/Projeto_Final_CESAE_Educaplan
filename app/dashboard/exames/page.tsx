"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createExam, getMyExams, deleteExam } from "@/actions/exam.actions";
import { getMyModules } from "@/actions/module.actions";
import { getMyExercises } from "@/actions/exercise.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type ExamItem = Awaited<ReturnType<typeof getMyExams>>[number];
type ModuleOption = { id: string; name: string };
type ExerciseOption = { id: string; title: string; points: number };

const TYPES = ["QUIZ", "MIDTERM", "FINAL", "PRACTICE"] as const;

export default function ExamsPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("QUIZ");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [maxScore, setMaxScore] = useState(100);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

  const load = async () => setExams(await getMyExams());

  useEffect(() => {
    load();
    getMyModules().then((m) => setModules(m.map((x) => ({ id: x.id, name: x.name }))));
    getMyExercises().then((e) =>
      setExercises(e.map((x) => ({ id: x.id, title: x.title, points: x.points })))
    );
  }, []);

  const toggleExercise = (id: string) =>
    setSelectedExerciseIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !moduleId || !date) return;
    setSaving(true);
    try {
      await createExam({
        name,
        moduleId,
        type,
        date,
        duration,
        maxScore,
        exerciseIds: selectedExerciseIds,
      });
      setName("");
      setDate("");
      setSelectedExerciseIds([]);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao criar o exame.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este exame?")) return;
    await deleteExam(id);
    await load();
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Exames</h1>

      <Card>
        <CardHeader>
          <CardTitle>Novo exame</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label>Módulo</Label>
                <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} className="p-2 border rounded w-full" required>
                  <option value="">— Selecione o módulo —</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Tipo</Label>
                <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="p-2 border rounded w-full">
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="duration">Duração (min)</Label>
                <Input id="duration" type="number" min={0} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="maxScore">Nota máxima</Label>
                <Input id="maxScore" type="number" min={0} value={maxScore} onChange={(e) => setMaxScore(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <Label>Exercícios (na ordem de seleção)</Label>
              {exercises.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum exercício disponível. Cria exercícios primeiro.</p>
              ) : (
                <ul className="border rounded max-h-56 overflow-auto divide-y">
                  {exercises.map((ex) => {
                    const idx = selectedExerciseIds.indexOf(ex.id);
                    return (
                      <li key={ex.id} className="flex items-center gap-2 p-2">
                        <input type="checkbox" checked={idx !== -1} onChange={() => toggleExercise(ex.id)} />
                        <span className="flex-1">{ex.title} ({ex.points} pts)</span>
                        {idx !== -1 && <span className="text-xs text-blue-600">#{idx + 1}</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <Button type="submit" disabled={saving}>{saving ? "A criar..." : "Criar exame"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Os meus exames ({exams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <p className="text-gray-500">Nenhum exame criado.</p>
          ) : (
            <ul className="divide-y">
              {exams.map((ex) => (
                <li key={ex.id} className="py-3 flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{ex.name}</p>
                    <p className="text-sm text-gray-600">
                      {ex.type} · Módulo: {ex.module.name} · {new Date(ex.date).toLocaleDateString("pt-PT")} ·{" "}
                      {ex._count.exercises} exercício(s) · {ex.duration} min
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => handleDelete(ex.id)}>Remover</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
