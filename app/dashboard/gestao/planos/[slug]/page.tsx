"use client"

import React, { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { enrollmentDataService, EnrollmentDetails } from "@/services/wrapper-services/enrollment-data.wrapper-service"
import { topicService } from "@/services/data-services/topic.service"
import { moduleLessonService } from "@/services/data-services/module-lesson.service"
import { generateId, minutesToHours } from "@/lib/utils/general.utils" // Use your existing utility
import { CourseStatusEnum, Lesson, Module, Topic } from "@/types/interfaces"
import { useCentralStore } from "@/store/central.store"

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-md p-4 my-4 shadow-sm bg-white">
      {title && <h2 className="text-lg font-bold mb-2">{title}</h2>}
      {children}
    </div>
  )
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium
      text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
       ${props.className ?? ""}`}
    >
      {props.children}
    </button>
  )
}

export default function EnrollmentPage() {
  const pathname = usePathname()
  const slug = pathname?.split("/").pop()

  const [enrollmentDetails, setEnrollmentDetails] = useState<EnrollmentDetails | null>(null)
  const [allTopics, setAllTopics] = useState<Topic[]>([])
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)

  const data = useCentralStore((state) => state.data)

  useEffect(() => {
    if (!slug) return

    const details = enrollmentDataService.getEnrollmentDetailsBySlug(slug)
    setEnrollmentDetails(details)

    const topics = topicService.getTopicsByTeacher()
    setAllTopics(topics)
  }, [slug, data])

  const handleAddLesson = async () => {
    if (!selectedModule) return

    const store = useCentralStore.getState()
    const existingModuleLessons = store.data.moduleLessons.filter(
      (ml) => ml.moduleId === selectedModule.id,
    )
    const lessonNumber = existingModuleLessons.length + 1
    const lessonName = `Aula ${lessonNumber}`

    const newLessonId = generateId()
    const newLesson: Lesson = {
      id: newLessonId,
      name: lessonName,
      slug: lessonName.toLowerCase().replace(/\s+/g, "-"),
      order: 0,
      duration: 0,
      teacherId: "cm6bntysq0005s911c7r7o87g",
      createdAt: new Date(),
      updatedAt: new Date(),
      status: CourseStatusEnum.DRAFT,
      lectured: false,
      description: "",
      topics: [],
    }

    store.addData("lessons", newLesson)

    await moduleLessonService.addLessonToModule(selectedModule.id, newLessonId)

    setSelectedModule(null)
  }

  const handleUpdateLessonTime = (lessonId: string, newDuration: number) => {
    enrollmentDataService.adjustLessonDuration(lessonId, newDuration)
  }

  const handleRemoveLesson = (lessonId: string) => {
    enrollmentDataService.deleteLesson(lessonId)
  }

  const handleAddTopicToLesson = (lessonId: string, topicId: string) => {
    enrollmentDataService.addTopicsToLesson(lessonId, [topicId])
  }

  const handleRemoveTopicFromLesson = (lessonId: string, topicId: string) => {
    enrollmentDataService.removeTopicsFromLesson(lessonId, [topicId])
  }

  if (!enrollmentDetails) {
    return (
      <div className="p-4">
        <h1 className="text-xl">A carregar detalhes de matrícula...</h1>
      </div>
    )
  }

  const { enrollment, modules, lessons, classes, users, moduleLessons } = enrollmentDetails

  return (
    <div className="p-4">
      <Card>
        <h1 className="text-2xl font-bold">Matricula: {enrollment.name}</h1>
        <p className="text-gray-600 mb-4">{enrollment.teacherId}</p>
        <p className="text-gray-600">
          Data de início: {new Date(enrollment.startDate).toLocaleDateString()} - Data de fim:{" "}
          {new Date(enrollment.endDate).toLocaleDateString()}
        </p>
      </Card>

      <Card title="Turmas">
        {classes && classes.length > 0 ? (
          classes.map((cls) => (
            <div key={cls.id} className="mb-2">
              <h3 className="font-semibold">{cls.name}</h3>
              <p>{cls.description}</p>
            </div>
          ))
        ) : (
          <p>Não foram encontradas turmas.</p>
        )}
      </Card>

      <Card title="Módulos">
        {modules.length === 0 ? (
          <p>Não existem módulos disponíveis de momento.</p>
        ) : (
          modules.map((mod) => {
            const mLessons = moduleLessons.filter((ml) => ml.moduleId === mod.id)
            const lessonsForModule = lessons.filter((lsn) =>
              mLessons.some((ml) => ml.lessonId === lsn.id),
            )

            return (
              <div key={mod.id} className="mb-6 border p-3 rounded">
                <h3 className="text-xl font-bold">
                  {mod.name} (Slug: {mod.slug})
                </h3>
                <p className="text-sm mb-2">Categoria: {mod.category}</p>
                <p className="text-sm mb-4">
                  : Horas <strong>{minutesToHours(mod.totalMinutes).toFixed(2)}</strong>
                </p>

                <div className="space-y-2">
                  {lessonsForModule.length > 0 ? (
                    lessonsForModule.map((lsn) => (
                      <div key={lsn.id} className="border rounded p-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{lsn.name}</h4>
                          <Button onClick={() => handleRemoveLesson(lsn.id)}>Remover</Button>
                        </div>
                        <p className="text-sm text-gray-600">Duração: {lsn.duration ?? 0} minutos</p>

                        <div className="flex space-x-2 mt-2">
                          <input
                            type="number"
                            min={0}
                            defaultValue={lsn.duration ?? 0}
                            onBlur={(e) => {
                              const newValue = parseInt(e.target.value, 10)
                              handleUpdateLessonTime(lsn.id, newValue)
                            }}
                            className="border rounded px-2 py-1 w-24"
                          />
                          <p className="text-sm text-gray-500 self-center">← Ajustar duração</p>
                        </div>

                        <div className="mt-2">
                          <h5 className="text-sm font-medium">Tópicos:</h5>
                          {lsn.topics && lsn.topics.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {lsn.topics.map((t: Topic) => (
                                <li key={t.id} className="flex justify-between">
                                  <span>{t.name}</span>
                                  <Button
                                    className="bg-red-300 hover:bg-red-500"
                                    onClick={() => handleRemoveTopicFromLesson(lsn.id, t.id)}
                                  >
                                    Remover
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 italic">Não existem tópicos de momento.</p>
                          )}
                          <div className="mt-2">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAddTopicToLesson(lsn.id, e.target.value)
                                  e.target.value = ""
                                }
                              }}
                              className="border rounded px-2 py-1"
                            >
                              <option value="">Adicionar Tópicos...</option>
                              {allTopics.map((topic) => (
                                <option key={topic.id} value={topic.id}>
                                  {topic.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Não existem aulas para já.</p>
                  )}
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <h4 className="font-semibold text-sm mb-2">Adicionar uma aula a {mod.name}</h4>
                  <Button
                    className="bg-gray-900"
                    onClick={() => {
                      setSelectedModule(mod)
                      handleAddLesson()
                    }}
                  >
                    + Adicionar nova aula
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </Card>

      <Card title="Students in this Enrollment">
        {users && users.length > 0 ? (
          <ul className="list-disc list-inside">
            {users.map((u) => (
              <li key={u.id}>
                {u.profile?.firstName} {u.profile?.lastName} ({u.email})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Não foram encontrados alunos de momento.</p>
        )}
      </Card>
    </div>
  )
}
