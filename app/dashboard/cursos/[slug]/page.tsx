"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { courseService } from "@/services/data-services/course.service"
import { courseModuleService } from "@/services/data-services/course-module.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Course, Module, Topic, Lesson } from "@/types/interfaces"
import { normalize } from "@/lib/utils/validation.utils"
import { minutesToHours } from "@/lib/utils"

interface ExtendedModule extends Module {
  topics: Topic[]
  lessons: Lesson[]
}

interface ExtendedCourse extends Course {
  modules: ExtendedModule[]
}

export default function CourseDetailPage() {
  const [course, setCourse] = useState<ExtendedCourse | null>(null)
  const [modules, setModules] = useState<ExtendedModule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true)
      try {
        const fetchedCourse = courseService.getCourseBySlug(slug)
        if (fetchedCourse) {
          const extendedCourse: ExtendedCourse = {
            ...fetchedCourse,
            modules: [],
          }
          setCourse(extendedCourse)

          const fetchedModules = courseModuleService.getModulesForCourse(fetchedCourse.id)
          const extendedModules: ExtendedModule[] = fetchedModules.map((module) => ({
            ...module,
            topics: [],
            lessons: [],
          }))
          setModules(extendedModules)
        } else {
          console.error("Course not found")
        }
      } catch (error) {
        console.error("Failed to fetch course:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [slug])

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Detalhes do Curso</h1>
        <div className="grid grid-cols-1 gap-4">
          <Card className="h-[300px] flex flex-col">
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
          {[...Array(2)].map((_, index) => (
            <Card key={index} className="h-[200px] flex flex-col">
              <CardHeader>
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex items-center justify-center h-40">
            <p className="text-lg text-gray-500">O curso não foi encontrado.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-14">
      <Card className="mb-4 hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-bold line-clamp-1">{course.name}</CardTitle>
          <CardDescription className="line-clamp-1">{course.category}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-between">
          <p className="text-sm text-gray-500 mb-2 line-clamp-3">{course.description}</p>
          <div className="flex gap-2 mt-auto">
            <Badge variant={course.status === "COMPLETED" ? "default" : "secondary"}>{normalize(course.status)}</Badge>
            <Badge variant={course.publishStatus === "PUBLISHED_FOR_RENT" ? "default" : "outline"}>
              {normalize(course.publishStatus)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {modules.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-center text-gray-500">Não foram encontrados módulos para este curso.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {modules.map((module) => (
            <Card key={module.id} className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="line-clamp-1 font-sm">Modulo</CardTitle>
                <CardTitle className="line-clamp-1">{module.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-sm text-gray-500 mb-2 line-clamp-3">{module.description}</p>
                <div className="flex justify-between text-sm mt-auto">
                  <div>
                    <p className="font-semibold">Total de horas</p>
                    <p>{minutesToHours(module.totalMinutes).toFixed(2)} horas</p>
                  </div>
                  <div>
                    <p className="font-semibold">Média por aula</p>
                    <p>{minutesToHours(module.averageMinutesPerLesson).toFixed(2)} horas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
                <CardTitle className="line-clamp-1">Detalhes do Curso</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <ul className="space-y-2">
            <li>
              <span className="font-semibold">Criado em:</span> {new Date(course.createdAt).toLocaleDateString()}
            </li>
            <li>
              <span className="font-semibold">Atualizado em:</span> {new Date(course.updatedAt).toLocaleDateString()}
            </li>
            <li>
              <span className="font-semibold">ID do Criador:</span> {course.creatorId}
            </li>

          </ul>
        </CardContent>
      </Card>
      <div className="h-10"></div>
    </div>
  )
}

