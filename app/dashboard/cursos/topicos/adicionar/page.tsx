/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { topicService } from "@/services/data-services/topic.service";
import { useCentralStore } from "@/store/central.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateTopicPage: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [addNewCategory, setAddNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [objectives, setObjectives] = useState<string[]>([""]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const topics = useCentralStore.getState().getData("topics") || [];
    const cats = Array.from(new Set(topics.map((t: any) => t.category).filter(Boolean)));
    setCategories(cats);
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

    const finalCategory =
      addNewCategory && newCategory.trim().length > 0 ? newCategory : category;

    const objectivesData = objectives
      .filter((obj) => obj.trim().length > 0)
      .map((obj) => ({ description: obj }));

    const topicData = {
      name,
      description,
      category: finalCategory,
      objectives: objectivesData,
    };

    const result = await topicService.addTopic(topicData);
    if (result.success) {
      setName("");
      setDescription("");
      setCategory("");
      setAddNewCategory(false);
      setNewCategory("");
      setObjectives([""]);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-lg font-bold mb-4">Adicionar Tópico</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="font-medium">
            Categoria:
          </label>
          <Select
            value={addNewCategory ? "add-new" : category}
            onValueChange={(val) => {
              if (val === "add-new") {
                setAddNewCategory(true);
                setCategory("");
              } else {
                setAddNewCategory(false);
                setCategory(val);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
              <SelectItem value="add-new">Adicionar nova categoria</SelectItem>
            </SelectContent>
          </Select>
          {addNewCategory && (
            <div className="mt-2">
              <Input
                placeholder="Introduza a nova categoria"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
          )}
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
        disabled={loading}
        className="mt-6 w-full"
        onClick={handleSubmit}
      >
        {loading ? "A criar Tópico..." : "Criar Tópico"}
      </Button>
    </div>
  );
};

export default CreateTopicPage;
