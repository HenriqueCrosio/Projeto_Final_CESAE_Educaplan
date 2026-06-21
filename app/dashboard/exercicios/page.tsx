"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createExercise, getMyExercises, deleteExercise } from "@/actions/exercise.actions";
import { getMyTopics } from "@/actions/topic.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type ExerciseItem = Awaited<ReturnType<typeof getMyExercises>>[number];
type TopicOption = { id: string; name: string };

const TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "LONG_ANSWER", "CODE", "FILE_UPLOAD"] as const;
const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("MULTIPLE_CHOICE");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("BEGINNER");
  const [points, setPoints] = useState(10);
  const [topicId, setTopicId] = useState("");
  const [isTeamExercise, setIsTeamExercise] = useState(false);

  const load = async () => setExercises(await getMyExercises());

  useEffect(() => {
    load();
    getMyTopics().then((t) => setTopics(t.map((x) => ({ id: x.id, name: x.name }))));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await createExercise({
        title,
        content,
        type,
        difficulty,
        points,
        topicId: topicId || null,
        isTeamExercise,
      });
      setTitle("");
      setContent("");
      setPoints(10);
      setTopicId("");
      setIsTeamExercise(false);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao criar o exercício.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este exercício?")) return;
    await deleteExercise(id);
    await load();
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Exercícios</h1>

      <Card>
        <CardHeader>
          <CardTitle>Novo exercício</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="content">Enunciado / conteúdo</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border rounded p-2 min-h-24"
                required
              />
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
                <Label>Dificuldade</Label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)} className="p-2 border rounded w-full">
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="points">Pontos</Label>
                <Input id="points" type="number" min={0} value={points} onChange={(e) => setPoints(Number(e.target.value))} />
              </div>
              <div>
                <Label>Tópico (opcional)</Label>
                <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className="p-2 border rounded w-full">
                  <option value="">— Nenhum —</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isTeamExercise} onChange={(e) => setIsTeamExercise(e.target.checked)} />
              Exercício de equipa
            </label>
            <Button type="submit" disabled={saving}>{saving ? "A criar..." : "Criar exercício"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Os meus exercícios ({exercises.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {exercises.length === 0 ? (
            <p className="text-gray-500">Nenhum exercício criado.</p>
          ) : (
            <ul className="divide-y">
              {exercises.map((ex) => (
                <li key={ex.id} className="py-3 flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{ex.title}</p>
                    <p className="text-sm text-gray-600">
                      {ex.type} · {ex.difficulty} · {ex.points} pts
                      {ex.topic ? ` · Tópico: ${ex.topic.name}` : ""}
                      {ex.isTeamExercise ? " · Equipa" : ""}
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
