"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createMaterial, getMyMaterials, deleteMaterial } from "@/actions/material.actions";
import { getMyModules } from "@/actions/module.actions";
import { getMyTopics } from "@/actions/topic.actions";
import { courseService } from "@/services/data-services/course.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type MaterialItem = Awaited<ReturnType<typeof getMyMaterials>>[number];
type Option = { id: string; name: string };

const TYPES = ["DOCUMENT", "VIDEO", "AUDIO", "LINK", "OTHER"] as const;

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [courses, setCourses] = useState<Option[]>([]);
  const [modules, setModules] = useState<Option[]>([]);
  const [topics, setTopics] = useState<Option[]>([]);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("DOCUMENT");
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [topicId, setTopicId] = useState("");

  const load = async () => setMaterials(await getMyMaterials());

  useEffect(() => {
    load();
    courseService.getCoursesByTeacher().then((c) => setCourses(c.map((x) => ({ id: x.id, name: x.name }))));
    getMyModules().then((m) => setModules(m.map((x) => ({ id: x.id, name: x.name }))));
    getMyTopics().then((t) => setTopics(t.map((x) => ({ id: x.id, name: x.name }))));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createMaterial({
        name,
        url: url || null,
        type,
        courseId: courseId || null,
        moduleId: moduleId || null,
        topicId: topicId || null,
      });
      setName("");
      setUrl("");
      setCourseId("");
      setModuleId("");
      setTopicId("");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao criar o material.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este material?")) return;
    await deleteMaterial(id);
    await load();
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Materiais</h1>

      <Card>
        <CardHeader>
          <CardTitle>Novo material</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="url">URL (opcional)</Label>
                <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label>Tipo</Label>
                <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="p-2 border rounded w-full">
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Curso (opcional)</Label>
                <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="p-2 border rounded w-full">
                  <option value="">— Nenhum —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Módulo (opcional)</Label>
                <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} className="p-2 border rounded w-full">
                  <option value="">— Nenhum —</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
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
            <Button type="submit" disabled={saving}>{saving ? "A criar..." : "Criar material"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Os meus materiais ({materials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <p className="text-gray-500">Nenhum material criado.</p>
          ) : (
            <ul className="divide-y">
              {materials.map((m) => (
                <li key={m.id} className="py-3 flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      {m.url ? (
                        <a href={m.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{m.name}</a>
                      ) : (
                        m.name
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {m.type}
                      {m.course ? ` · Curso: ${m.course.name}` : ""}
                      {m.module ? ` · Módulo: ${m.module.name}` : ""}
                      {m.topic ? ` · Tópico: ${m.topic.name}` : ""}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => handleDelete(m.id)}>Remover</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
