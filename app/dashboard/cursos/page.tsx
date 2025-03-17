"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { courseService } from "@/services/data-services/course.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Course } from "@/types/interfaces"
import { normalize } from "@/lib/utils/validation.utils"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("q") || ""

  useEffect(() => {
    const fetchCourses = () => {
      try {
        const ownCourses = courseService.getCoursesByTeacher()
        setCourses(ownCourses)
        setFilteredCourses(ownCourses)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    const filtered = courses.filter((course) => course.name.toLowerCase().includes(searchQuery.toLowerCase()))
    setFilteredCourses(filtered)
  }, [searchQuery, courses])

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Meus Cursos Criados</h1>
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
      {filteredCourses.length === 0 ? (
        <p className="text-gray-600">
          {searchQuery ? "Nenhum curso encontrado com esse nome." : "Você ainda não criou nenhum curso."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <Link key={course.id} href={`/dashboard/cursos/${course.slug}`} className="block h-full">
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{course.name}</CardTitle>
                  <CardDescription className="line-clamp-1">{course.category}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <p className="text-sm text-gray-500 mb-2 line-clamp-3">{course.description}</p>
                  <div className="flex gap-2 mt-auto">
                    <Badge variant={course.status === "COMPLETED" ? "default" : "secondary"}>
                      {normalize(course.status)}
                    </Badge>
                    <Badge variant={course.publishStatus === "PUBLISHED_FOR_RENT" ? "default" : "outline"}>
                      {normalize(course.publishStatus)}
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

