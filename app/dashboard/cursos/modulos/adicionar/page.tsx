"use client";

import React, { useState, useEffect } from "react";
import { moduleWrapperService } from "@/services/wrapper-services/module.wrapper-service";
import { moduleService } from "@/services/data-services/module.service";
import { useCentralStore } from "@/store/central.store";

// Shadcn UI components (adjust the import paths as needed)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hoursToMinutes } from "@/lib/utils";
import { Topic } from "@/types/interfaces";

// Format minutes into a readable string in Portuguese (e.g., "1 hora e 10 minutos")
const formatDuration = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) {
    return `${hrs} ${hrs === 1 ? "hora" : "horas"} e ${mins} ${mins === 1 ? "minuto" : "minutos"}`;
  } else if (hrs > 0) {
    return `${hrs} ${hrs === 1 ? "hora" : "horas"}`;
  } else {
    return `${mins} ${mins === 1 ? "minuto" : "minutos"}`;
  }
};

const CreateModulePage: React.FC = () => {
  // Basic module fields (variables in English)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Category dropdown – data is loaded via getCategories()
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [addNewCategory, setAddNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Duration values (user inputs in hours; stored in minutes)
  const [totalHours, setTotalHours] = useState(0);
  const [averageHours, setAverageHours] = useState(0);

  // Topic selection
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);

  // Loading state for submission
  const [loading, setLoading] = useState(false);

  // On mount, load available topics from the central store.
  useEffect(() => {
    const topics = useCentralStore.getState().getData("topics") || [];
    setAvailableTopics(topics);
  }, []);

  // Load categories from the moduleService (getCategories is synchronous)
  useEffect(() => {
    const cats = moduleService.getCategories();
    setCategories(cats);
  }, []);

  // Calculate durations in minutes
  const totalMinutes = hoursToMinutes(totalHours);
  const averageMinutes = hoursToMinutes(averageHours);
  const numberOfLessons = averageMinutes > 0 ? Math.floor(totalMinutes / averageMinutes) : 0;
  const calculatedRemainder =
    averageMinutes > 0 ? totalMinutes - numberOfLessons * averageMinutes : 0;

  // Toggle topic selection when clicking a button
  const toggleTopic = (topicId: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  // On form submission, calculate final values and call the service.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Determine the final category: if adding a new category, use that value; otherwise, use the selected one.
    const finalCategory =
      addNewCategory && newCategory.trim().length > 0 ? newCategory : category;

    // Prepare the module data (all durations are stored in minutes)
    const moduleData = {
      name,
      description,
      category: finalCategory,
      totalMinutes,
      averageMinutesPerLesson: averageMinutes,
      minutesToAllocate: calculatedRemainder, // Use the automatically calculated remainder
    };

    // Call the service that creates the module, associates topics, and generates lessons.
    const result = await moduleWrapperService.createModuleWithTopicsAndLessons(
      moduleData,
      selectedTopicIds
    );

    if (result.success) {
      // Clear the fields on success
      setName("");
      setDescription("");
      setCategory("");
      setAddNewCategory(false);
      setNewCategory("");
      setTotalHours(0);
      setAverageHours(0);
      setSelectedTopicIds([]);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto ">
      <h1 className="text-lg font-bold mb-4">Configurar Módulo</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Module Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="moduleName" className="font-medium">
            Nome do Módulo:
          </label>
          <Input
            id="moduleName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Introduza o nome do módulo"
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="font-medium">
            Descrição:
          </label>
          <textarea
            id="description"
            className="p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Introduza a descrição do módulo"
            required
          />
        </div>

        {/* Category: Dropdown with an option to add a new category */}
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

        {/* Durations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Duration */}
          <div className="flex flex-col gap-1">
            <label htmlFor="totalHours" className="font-medium">
              Duração Total (em horas):
            </label>
            <Input
              id="totalHours"
              type="number"
              value={totalHours}
              onChange={(e) => setTotalHours(parseFloat(e.target.value))}
              min="0"
              step="0.1"
              required
            />
          </div>
          {/* Average Lesson Duration */}
          <div className="flex flex-col gap-1">
            <label htmlFor="averageHours" className="font-medium">
              Duração Média da Aula (em horas):
            </label>
            <Input
              id="averageHours"
              type="number"
              value={averageHours}
              onChange={(e) => setAverageHours(parseFloat(e.target.value))}
              min="0"
              step="0.1"
              required
            />
          </div>
        </div>

        {/* Information Card: Shows generated lessons and time per lesson */}
        {averageHours > 0 && (
          <div className="border p-4 rounded space-y-3">
            <p className="text-sm text-gray-600">
              <strong>Aulas geradas:</strong> {numberOfLessons}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Duração de cada aula:</strong> {formatDuration(averageMinutes)}
            </p>
            {calculatedRemainder > 0 && (
              <p className="text-sm text-gray-600">
                <strong>Tempo restante a alocar:</strong> {formatDuration(calculatedRemainder)}
              </p>
            )}
          </div>
        )}

        {/* Topic Selection */}
        <div className="flex flex-col gap-2">
          <span className="font-medium">Selecionar Tópicos:</span>
          {availableTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableTopics.map((topic: Topic) => (
                <Button
                  key={topic.id}
                  type="button" // Ensure these buttons do not trigger form submission
                  variant={selectedTopicIds.includes(topic.id) ? "default" : "outline"}
                  onClick={() => toggleTopic(topic.id)}
                >
                  {topic.name}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Não existem tópicos disponíveis. Por favor, adicione tópicos ao store central.
            </p>
          )}
        </div>
      </form>

      <Button
        type="submit"
        disabled={loading}
        className="mt-6 w-full"
        onClick={handleSubmit}
      >
        {loading ? "A criar Módulo..." : "Criar Módulo"}
      </Button>
    </div>
  );
};

export default CreateModulePage;
