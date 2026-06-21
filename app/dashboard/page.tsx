"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getTodaySchedules } from "@/actions/schedule.actions"
import { Card, CardContent, CardContainer } from "@/components/ui/card"
import { CalendarClock } from "lucide-react"
import { TeacherDashboard } from "@/components/dashboard/teacher/teacher-dashboard"

interface LessonCardProps {
  lesson: {
    id: string
    lessonName: string
    formattedStartTime: string
    className: string
    moduleName: string
    courseName: string
    classColor: string
  }
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  return (
    <Link
      href={`/aula/${lesson.id}`}
      aria-label={`Ver detalhes de ${lesson.className}: ${lesson.lessonName}`}
      className="block h-full"
    >
      <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group h-full flex flex-col">
        <div className="p-4 flex-grow" style={{ backgroundColor: `${lesson.classColor}10` }}>
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-sm font-semibold px-2 py-1 rounded-full"
              style={{ backgroundColor: lesson.classColor, color: "white" }}
            >
              {lesson.className}
            </span>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4 mr-1" />
              <span>{lesson.formattedStartTime}</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2 truncate">{lesson.courseName}</h3>
          <p className="text-sm text-muted-foreground mb-1 truncate">Módulo: {lesson.moduleName}</p>
          <p className="text-sm truncate">Aula: {lesson.lessonName}</p>
        </div>
        <CardContent className="border-t p-3 bg-muted/50 flex justify-between items-center">
          <span className="text-sm font-medium">Ver detalhes</span>
          <svg
            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function TodaysLessonsPage() {
  const [currentLessons, setCurrentLessons] = useState<LessonCardProps["lesson"][]>([])

  useEffect(() => {
    const updateLessons = async () => {
      const schedules = await getTodaySchedules()
      const mapped = schedules.map((s) => ({
        id: s.id,
        className: s.class.name,
        classColor: s.class.color || "#CCCCCC",
        lessonName: s.lesson.name,
        moduleName: s.lesson.module?.name ?? "—",
        courseName: s.lesson.module?.course?.name ?? "—",
        formattedStartTime: new Date(s.dateTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }))
      setCurrentLessons(mapped)
    }

    updateLessons()
    const intervalId = setInterval(updateLessons, 60000)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="p-12">
      <CardContainer className="flex flex-col gap-4 w-full mb-8">
        <h2 className="text-2xl font-bold">Aulas</h2>
        {currentLessons.length === 0 ? (
          <p className="text-muted-foreground">As aulas ainda não começaram.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        )}
      </CardContainer>

      <div className="m-8 border-t border-muted-foreground"></div>

      <TeacherDashboard />
    </div>
  )
}
