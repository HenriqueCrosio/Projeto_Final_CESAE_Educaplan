"use client";

import React, { useState, useEffect } from "react";
import { moduleService } from "@/services/data-services/module.service";
import { moduleLessonService } from "@/services/data-services/module-lesson.service";
import { lessonService } from "@/services/data-services/lesson.service";
import { topicService } from "@/services/data-services/topic.service";
import { Button } from "@/components/ui/button";
import type { Module } from "@prisma/client";
import { CourseStatusEnum, PublishStatusEnum } from "@prisma/client";
import type { LessonWithTopics } from "@/services/data-services/lesson.service";
import type { TopicListItem } from "@/services/data-services/topic.service";

// Helper function: formats minutes as "X hora(s) e Y minuto(s)" in Portuguese.
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

/**
 * ModuleCard displays the detailed view for one module.
 * It lists its lessons and for each lesson, it allows editing:
 * - The teacher can update the lecture hours (input in hours, stored as minutes).
 * - The teacher can select topics to associate with the lesson (checkbox list).
 * When the teacher saves changes, the lesson status is updated to COMPLETED.
 *
 * If there are no lessons, a button "Adicionar Aula" is shown.
 */
const ModuleCard: React.FC<{ module: Module; lessonFilter: "DRAFT" | "COMPLETED" }> = ({
  module,
  lessonFilter,
}) => {
  const [lessons, setLessons] = useState<LessonWithTopics[]>([]);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [lectureHours, setLectureHours] = useState<number>(0);
  const [availableTopics, setAvailableTopics] = useState<TopicListItem[]>([]);

  useEffect(() => {
    // Retrieve the lessons for this module (Postgres).
    moduleLessonService.getLessonsForModule(module.id).then(setLessons);
  }, [module.id]);

  useEffect(() => {
    // Tópicos do professor (Postgres). Usados para associar a aulas.
    topicService.getTopicsByTeacher().then(setAvailableTopics);
  }, []);

  // Filter lessons based on the lessonFilter prop.
  const filteredLessons = lessons.filter((lesson) => lesson.status === lessonFilter);

  // Open the lesson editor.
  const handleEditLessonClick = (lesson: LessonWithTopics) => {
    setEditingLessonId(lesson.id);
    setSelectedTopicIds(lesson.topics.map((t) => t.id));
    // Pre-fill lecture hours from the current duration (stored in minutes).
    setLectureHours(lesson.duration ? lesson.duration / 60 : 0);
  };

  // Save changes to the lesson (update topics, lecture hours, and mark as COMPLETED).
  const handleSaveLessonChanges = async (lesson: LessonWithTopics) => {
    const newDuration = Math.round(lectureHours * 60);
    const updateResult = await lessonService.updateLesson(lesson.id, {
      topicIds: selectedTopicIds,
      duration: newDuration,
      status: CourseStatusEnum.COMPLETED,
    });
    if (updateResult.success) {
      const updatedLessons = await moduleLessonService.getLessonsForModule(module.id);
      setLessons(updatedLessons);
      setEditingLessonId(null);
    }
  };

  // Add a new lesson to this module.
  const handleAddLesson = async () => {
    const order = lessons.length + 1;
    const result = await lessonService.addLesson({
      name: `Aula ${order}`,
      description: `Aula ${order} do módulo.`,
      duration: 120, // Padrão: 2 horas (120 minutos)
      order,
      moduleId: module.id,
    });
    if (result.success && result.lesson) {
      const updatedLessons = await moduleLessonService.getLessonsForModule(module.id);
      setLessons(updatedLessons);
    }
  };

  return (
    <div className="border p-4 rounded mb-4">
      <h3 className="text-xl font-bold">{module.name}</h3>
      <p className="text-sm">{module.description}</p>
      <div className="mt-2">
        <h4 className="font-medium">
          {lessonFilter === "DRAFT" ? "Aulas em Rascunho" : "Aulas Completadas"}:
        </h4>
        {filteredLessons.length > 0 ? (
          <ul className="mt-2">
            {filteredLessons.map((lesson) => (
              <li key={lesson.id} className="border p-2 rounded mb-2">
                <div className="flex items-center justify-between">
                  <span>
                    {lesson.name} – {formatDuration(lesson.duration!)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditLessonClick(lesson)}
                  >
                    Editar Lição
                  </Button>
                </div>
                {editingLessonId === lesson.id && (
                  <div className="mt-2 border p-2 rounded">
                    <h5 className="font-medium mb-1">Editar Lição: {lesson.name}</h5>
                    <div className="mb-2">
                      <label className="font-medium block">Horas para lecionar:</label>
                      <input
                        type="number"
                        value={lectureHours}
                        onChange={(e) => setLectureHours(parseFloat(e.target.value))}
                        className="border p-1 rounded w-full"
                        step="0.1"
                        min="0"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="font-medium block">Selecionar Tópicos:</label>
                      <div className="flex flex-wrap gap-2">
                        {availableTopics.map((topic) => (
                          <label key={topic.id} className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={selectedTopicIds.includes(topic.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTopicIds((prev) => [...prev, topic.id]);
                                } else {
                                  setSelectedTopicIds((prev) =>
                                    prev.filter((id) => id !== topic.id)
                                  );
                                }
                              }}
                            />
                            <span className="text-sm">{topic.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="default"
                        onClick={() => handleSaveLessonChanges(lesson)}
                      >
                        Salvar Alterações
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Nenhuma aula encontrada neste status.</p>
        )}
        <div className="mt-2">
          <Button type="button" variant="default" onClick={handleAddLesson}>
            Adicionar Aula
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * ModuleSlider displays the modules in a horizontal slider.
 * When a module is clicked, it becomes the selected module and its detailed configuration is shown.
 */
const ModuleSlider: React.FC<{
  modules: Module[];
  selectedModuleId: string | null;
  onSelect: (mod: Module) => void;
}> = ({ modules, selectedModuleId, onSelect }) => {
  return (
    <div className="overflow-x-auto py-2">
      <div className="flex space-x-4">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className={`min-w-[200px] p-4 border rounded cursor-pointer ${
              selectedModuleId === mod.id ? "bg-gray-100" : ""
            }`}
            onClick={() => onSelect(mod)}
          >
            <h3 className="font-bold">{mod.name}</h3>
            <p className="text-sm">{mod.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * EditableModulesPage displays only the modules that the teacher can edit,
 * in a slide (carousel) format. When a module is selected, its detailed configuration
 * is shown below for editing lessons (to update topics and lecture hours).
 */
const EditableModulesPage: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  // Toggle between "DRAFT" and "COMPLETED" lessons.
  const [lessonFilter, setLessonFilter] = useState<"DRAFT" | "COMPLETED">("DRAFT");

  useEffect(() => {
    const fetchModules = async () => {
      // Retrieve modules owned or created by the teacher.
      const teacherModules = await moduleService.getModulesByTeacher();
      // Filter only modules that are editable (with PRIVATE publish status).
      const editableModules = teacherModules.filter(
        (mod) => mod.publishStatus === PublishStatusEnum.PRIVATE
      );
      // Sort modules so that the last created appears first.
      editableModules.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setModules(editableModules);
      // Optionally, select the first module by default.
      if (editableModules.length > 0) {
        setSelectedModule(editableModules[0]);
      }
    };
    fetchModules();
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-lg font-bold mb-4">Preparar Aulas</h1>
      <ModuleSlider
        modules={modules}
        selectedModuleId={selectedModule ? selectedModule.id : null}
        onSelect={(mod) => setSelectedModule(mod)}
      />
      <div className="my-4">
        <span className="font-medium">Filtrar Aulas:</span>
        <div className="mt-1">
          <Button
            type="button"
            variant={lessonFilter === "DRAFT" ? "default" : "outline"}
            onClick={() => setLessonFilter("DRAFT")}
          >
            Aulas em Rascunho
          </Button>
          <Button
            type="button"
            variant={lessonFilter === "COMPLETED" ? "default" : "outline"}
            onClick={() => setLessonFilter("COMPLETED")}
            className="ml-2"
          >
            Aulas Completadas
          </Button>
        </div>
      </div>
      {selectedModule ? (
        <ModuleCard module={selectedModule} lessonFilter={lessonFilter} />
      ) : (
        <p className="text-sm text-gray-600">Nenhum módulo selecionado.</p>
      )}
    </div>
  );
};

export default EditableModulesPage;
