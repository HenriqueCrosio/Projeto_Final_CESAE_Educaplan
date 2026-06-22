"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import {
  createExercise,
  getMyExercises,
  deleteExercise,
  setExerciseOptions,
  type ExerciseOptionInput,
} from "@/actions/exercise.actions";
import { getMyTopics } from "@/actions/topic.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type ExerciseItem = Awaited<ReturnType<typeof getMyExercises>>[number];
type TopicOption = { id: string; name: string };
type OptInput = ExerciseOptionInput;

const TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "LONG_ANSWER", "CODE", "FILE_UPLOAD"] as const;
type ExType = (typeof TYPES)[number];
const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;

const usesOptions = (type: ExType) => type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE";

/** Opções iniciais ao escolher (ou mudar para) um tipo com gabarito. */
function defaultOptionsFor(type: ExType): OptInput[] {
  if (type === "TRUE_FALSE") {
    return [
      { text: "Verdadeiro", isCorrect: true },
      { text: "Falso", isCorrect: false },
    ];
  }
  if (type === "MULTIPLE_CHOICE") {
    return [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ];
  }
  return [];
}

/**
 * Editor de gabarito (resposta única). TRUE_FALSE = 2 opções fixas, só o rádio
 * editável; MULTIPLE_CHOICE = texto editável + adicionar/remover (mínimo 2).
 */
function OptionsEditor({ type, value, onChange }: { type: ExType; value: OptInput[]; onChange: (o: OptInput[]) => void }) {
  const groupName = useId();
  if (!usesOptions(type)) return null;
  const isTF = type === "TRUE_FALSE";

  const setCorrect = (idx: number) => onChange(value.map((o, i) => ({ ...o, isCorrect: i === idx })));
  const setText = (idx: number, text: string) => onChange(value.map((o, i) => (i === idx ? { ...o, text } : o)));
  const addOption = () => onChange([...value, { text: "", isCorrect: false }]);
  const removeOption = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    // Garante que continua a haver exatamente 1 correta.
    if (!next.some((o) => o.isCorrect) && next.length) next[0].isCorrect = true;
    onChange(next);
  };

  return (
    <div className="space-y-2 rounded border bg-gray-50 p-3">
      <p className="text-sm font-medium">Gabarito · marque a opção correta</p>
      {value.map((opt, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            type="radio"
            name={groupName}
            checked={opt.isCorrect}
            onChange={() => setCorrect(idx)}
            aria-label="Correta"
          />
          {isTF ? (
            <span className="flex-1 text-sm">{opt.text}</span>
          ) : (
            <Input
              value={opt.text}
              placeholder={`Opção ${idx + 1}`}
              onChange={(e) => setText(idx, e.target.value)}
              className="flex-1"
            />
          )}
          {!isTF && value.length > 2 && (
            <Button type="button" variant="outline" size="sm" onClick={() => removeOption(idx)}>
              ✕
            </Button>
          )}
        </div>
      ))}
      {!isTF && (
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          + Adicionar opção
        </Button>
      )}
    </div>
  );
}

/** Linha da lista: resumo + editor de gabarito inline (MC/TF) + remover. */
function ExerciseRow({ ex, onChanged }: { ex: ExerciseItem; onChanged: () => void }) {
  const type = ex.type as ExType;
  const [editing, setEditing] = useState(false);
  const [opts, setOpts] = useState<OptInput[]>([]);
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    const existing = ex.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect }));
    setOpts(existing.length ? existing : defaultOptionsFor(type));
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await setExerciseOptions(ex.id, opts);
      setEditing(false);
      onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao guardar o gabarito.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remover este exercício?")) return;
    await deleteExercise(ex.id);
    onChanged();
  };

  const hasGabarito = ex.options.length > 0;

  return (
    <li className="py-3 space-y-2">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="font-semibold">{ex.title}</p>
          <p className="text-sm text-gray-600">
            {ex.type} · {ex.difficulty} · {ex.points} pts
            {ex.topic ? ` · Tópico: ${ex.topic.name}` : ""}
            {ex.isTeamExercise ? " · Equipa" : ""}
          </p>
          {usesOptions(type) && (
            <p className={`text-xs ${hasGabarito ? "text-green-700" : "text-amber-600"}`}>
              {hasGabarito ? `Gabarito: ${ex.options.length} opções (auto-corrigível)` : "Sem gabarito — não pode ser auto-corrigido"}
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {usesOptions(type) && !editing && (
            <Button variant="outline" onClick={startEdit}>
              {hasGabarito ? "Editar gabarito" : "Definir gabarito"}
            </Button>
          )}
          <Button variant="outline" onClick={handleDelete}>Remover</Button>
        </div>
      </div>

      {editing && (
        <div className="space-y-2">
          <OptionsEditor type={type} value={opts} onChange={setOpts} />
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>{saving ? "A guardar..." : "Guardar gabarito"}</Button>
            <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<ExType>("MULTIPLE_CHOICE");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("BEGINNER");
  const [points, setPoints] = useState(10);
  const [topicId, setTopicId] = useState("");
  const [isTeamExercise, setIsTeamExercise] = useState(false);
  const [options, setOptions] = useState<OptInput[]>(defaultOptionsFor("MULTIPLE_CHOICE"));

  const load = async () => setExercises(await getMyExercises());

  useEffect(() => {
    load();
    getMyTopics().then((t) => setTopics(t.map((x) => ({ id: x.id, name: x.name }))));
  }, []);

  // Ao mudar o tipo, reinicia o gabarito para o default desse tipo.
  const handleTypeChange = (next: ExType) => {
    setType(next);
    setOptions(defaultOptionsFor(next));
  };

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
        options: usesOptions(type) ? options : undefined,
      });
      setTitle("");
      setContent("");
      setPoints(10);
      setTopicId("");
      setIsTeamExercise(false);
      setOptions(defaultOptionsFor(type));
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao criar o exercício.");
    } finally {
      setSaving(false);
    }
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
                <select value={type} onChange={(e) => handleTypeChange(e.target.value as ExType)} className="p-2 border rounded w-full">
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

            <OptionsEditor type={type} value={options} onChange={setOptions} />
            {usesOptions(type) && (
              <p className="text-xs text-gray-500">
                Deixe as opções em branco para criar sem gabarito (poderá defini-lo depois na lista).
              </p>
            )}

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
                <ExerciseRow key={ex.id} ex={ex} onChanged={load} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
