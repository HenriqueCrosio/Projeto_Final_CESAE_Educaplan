"use client";

import React, { useState, useEffect } from "react";
import { topicService } from "@/services/data-services/topic.service";
import { moduleService } from "@/services/data-services/module.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Module } from "@prisma/client";

const CreateTopicPage: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const teacherModules = await moduleService.getModulesByTeacher();
      setModules(teacherModules);
    };
    load();
  }, []);

  const addObjectiveField = () => {
    setObjectives([...objectives, ""]);
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const objectivesData = objectives
      .filter((obj) => obj.trim().length > 0)
      .map((obj) => ({ description: obj }));

    const topicData = {
      name,
      description,
      moduleId: selectedModuleId,
      objectives: objectivesData,
    };

    const result = await topicService.addTopic(topicData);
    if (result.success) {
      setSelectedModuleId("");
      setName("");
      setDescription("");
      setObjectives([""]);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-lg font-bold mb-4">Adicionar Tópico</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Módulo-pai (Opção A) */}
        <div className="flex flex-col gap-1">
          <label htmlFor="module" className="font-medium">
            Módulo:
          </label>
          <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o módulo a que o tópico pertence" />
            </SelectTrigger>
            <SelectContent>
              {modules.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {modules.length === 0 && (
            <p className="text-sm text-gray-600">
              Crie um módulo primeiro para poder adicionar tópicos.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="topicName" className="font-medium">
            Nome do Tópico:
          </label>
          <Input
            id="topicName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Introduza o nome do tópico"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="font-medium">
            Descrição:
          </label>
          <textarea
            id="description"
            className="p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Introduza a descrição do tópico"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-medium">Objetivos:</span>
          {objectives.map((obj, index) => (
            <Input
              key={index}
              value={obj}
              onChange={(e) => updateObjective(index, e.target.value)}
              placeholder={`Objetivo ${index + 1}`}
              required
            />
          ))}
          <Button type="button" onClick={addObjectiveField} variant="outline">
            Adicionar objetivo
          </Button>
        </div>
      </form>

      <Button
        type="submit"
        disabled={loading || !selectedModuleId}
        className="mt-6 w-full"
        onClick={handleSubmit}
      >
        {loading ? "A criar Tópico..." : "Criar Tópico"}
      </Button>
    </div>
  );
};

export default CreateTopicPage;
