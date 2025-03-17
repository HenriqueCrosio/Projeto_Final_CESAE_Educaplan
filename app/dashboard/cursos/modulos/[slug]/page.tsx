"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Module, Topic, Lesson } from "@/types/interfaces"
import { normalize } from "@/lib/utils/validation.utils"
import { moduleWrapperService } from "@/services/wrapper-services/module.wrapper-service"

interface ModuleWithDetails extends Module {
  topics: Topic[]
  lessons: Lesson[]
}

export default function ModuleDetailPage() {
  const [moduleWithDetails, setModuleWithDetails] = useState<ModuleWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    const fetchModuleDetails = async () => {
      setIsLoading(true)
      try {
        // Utilizar a função que retorna o módulo com tópicos e aulas
        const fetchedModule = moduleWrapperService.getModuleWithTopicsAndLessons(slug)
        if (fetchedModule) {
          setModuleWithDetails(fetchedModule)
        } else {
          console.error("Módulo não encontrado.")
        }
      } catch (error) {
        console.error("Falha ao obter os detalhes do módulo:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchModuleDetails()
  }, [slug])

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Card className="h-[400px] flex flex-col">
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="flex-grow">
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!moduleWithDetails) {
    return <div className="container mx-auto p-4">Módulo não encontrado</div>
  }

  return (
    <div className="container mx-auto mt-12">
      <Card className="flex flex-col mb-4">
        <CardHeader>
          <CardTitle className="line-clamp-1">{moduleWithDetails.name}</CardTitle>
          <CardDescription className="line-clamp-1">{moduleWithDetails.category}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-gray-500 mb-4">{moduleWithDetails.description}</p>
          <h4 className="text-sm font-semibold mt-4 mb-1">Detalhes:</h4>
          <ul className="text-xs text-gray-600 list-disc list-inside">
            <li className="ml-6">Total de Minutos: {moduleWithDetails.totalMinutes}</li>
            {moduleWithDetails.averageMinutesPerLesson && (
              <li className="ml-6">Média de Minutos por Aula: {moduleWithDetails.averageMinutesPerLesson}</li>
            )}
            <li className="ml-6">Criado: {new Date(moduleWithDetails.createdAt).toLocaleDateString()}</li>
            <li className="ml-6">Atualizado: {new Date(moduleWithDetails.updatedAt).toLocaleDateString()}</li>
            <li className="ml-6">ID do Criador: {moduleWithDetails.creatorId}</li>
          </ul>
          <div className="flex gap-2 mt-4">
            <Badge variant={moduleWithDetails.publishStatus === "PUBLISHED_FOR_RENT" ? "default" : "outline"}>
              {normalize(moduleWithDetails.publishStatus)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Tópicos</CardTitle>
        </CardHeader>
        <CardContent>
          {moduleWithDetails.topics.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-600">
              {moduleWithDetails.topics.map((topic) => (
                <li key={topic.id}>
                  <strong>{topic.name}</strong>: {topic.description}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Nenhum tópico associado.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aulas</CardTitle>
        </CardHeader>
        <CardContent>
          {moduleWithDetails.lessons.length > 0 ? (
            <ul className="list-decimal list-inside text-sm text-gray-600">
              {moduleWithDetails.lessons.map((lesson) => (
                <li key={lesson.id} className="mb-2">
                  <strong>{lesson.name}</strong> – Duração: {lesson.duration} minutos
                  <p className="text-xs text-gray-500">
                    Ordem: {lesson.order} | Criada: {new Date(lesson.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Nenhuma aula gerada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
