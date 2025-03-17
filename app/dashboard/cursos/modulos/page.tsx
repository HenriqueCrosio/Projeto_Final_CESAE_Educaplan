"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { moduleService } from "@/services/data-services/module.service"
import { moduleLessonService } from "@/services/data-services/module-lesson.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Module } from "@/types/interfaces"
import { normalize } from "@/lib/utils/validation.utils"

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [filteredModules, setFilteredModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("q") || ""

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const ownModules = moduleService.getModulesByTeacher()
        const modulesWithLessons = await Promise.all(
          ownModules.map(async (module) => {
            const lessons = await moduleLessonService.getLessonsForModule(module.id)
            return { ...module, lessonCount: lessons.length }
          }),
        )
        setModules(modulesWithLessons)
        setFilteredModules(modulesWithLessons)
      } finally {
        setIsLoading(false)
      }
    }

    fetchModules()
  }, [])

  useEffect(() => {
    const filtered = modules.filter((module) => module.name.toLowerCase().includes(searchQuery.toLowerCase()))
    setFilteredModules(filtered)
  }, [searchQuery, modules])

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Meus Módulos Criados</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="h-[300px] flex flex-col">
              <CardHeader>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <div className="p-6 mt-auto">
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      {filteredModules.length === 0 ? (
        <p className="text-gray-600">
          {searchQuery ? "Nenhum módulo encontrado com esse nome." : "Você ainda não criou nenhum módulo."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((module) => (
            <Link key={module.id} href={`/dashboard/cursos/modulos/${module.slug}`} className="block h-full">
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{module.name}</CardTitle>
                  <CardDescription className="line-clamp-1">{module.category}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <p className="text-sm text-gray-500 mb-2 line-clamp-3">{module.description}</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <Badge variant="secondary">{module.totalMinutes} minutos</Badge>
                    <Badge variant="outline">{module.lessonCount} aulas</Badge>
                    <Badge variant={module.publishStatus === "PUBLISHED_FOR_RENT" ? "default" : "outline"}>
                      {normalize(module.publishStatus)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <div className="h-10"></div>
    </div>
  )
}

