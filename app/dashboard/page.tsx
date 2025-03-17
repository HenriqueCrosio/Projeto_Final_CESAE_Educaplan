/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { scheduleService } from "@/services/wrapper-services/enrollment-schedule.wrapper-service"
import { Card, CardContent, CardContainer } from "@/components/ui/card"
import { CalendarClock } from "lucide-react"
import { useCentralStore } from "@/store/central.store"
import { TeacherDashboard } from "@/components/dashboard/teacher/teacher-dashboard"

interface LessonCardProps {
  lesson: {
    id: string
    lessonName: string
    formattedStartTime: string
    formattedEndTime: string
    duration: number
    className: string
    moduleName: string
    courseName: string
    teacherName: string
    classColor: string
  }
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  return (
    <Link
      href={`/aula/${lesson.id}`}
      aria-label={`View details for ${lesson.className}: ${lesson.lessonName}`}
      className="block h-full"
    >
      <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group h-full flex flex-col">
        <div
          className="p-4 flex-grow"
          style={{ backgroundColor: `${lesson.classColor}10` }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-sm font-semibold px-2 py-1 rounded-full"
              style={{
                backgroundColor: lesson.classColor,
                color: "white",
              }}
            >
              {lesson.className}
            </span>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4 mr-1" />
              <span>{lesson.formattedStartTime}</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2 truncate">{lesson.courseName}</h3>
          <p className="text-sm text-muted-foreground mb-1 truncate">
            Module: {lesson.moduleName}
          </p>
          <p className="text-sm truncate">Lesson: {lesson.lessonName}</p>
        </div>
        <CardContent className="border-t p-3 bg-muted/50 flex justify-between items-center">
          <span className="text-sm font-medium">View Details</span>
          <svg
            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function TodaysLessonsPage() {
  const [currentLessons, setCurrentLessons] = useState<any[]>([])
  const store = useCentralStore()

  useEffect(() => {
    const updateLessons = () => {
      const now = new Date()
      const todaysLessons = scheduleService.getTodaysLessons()

      const visibleLessons = todaysLessons.filter((lesson) => {
        const startTime = new Date(lesson.startTime)
        const endTime = lesson.endTime
          ? new Date(lesson.endTime)
          : new Date(startTime.getTime() + lesson.duration * 60000)
        return now <= endTime
      })

      const lessonsWithDetails = visibleLessons.map((lesson) => {
        const classDetails = scheduleService.getClassDetails(lesson.classId)
        const lessonDetails = store.getData("lessons").find((l) => l.id === lesson.lessonId)
        const moduleDetails = store.getData("modules").find((m) => m.id === lesson.moduleId)
        const courseDetails = store.getData("courses").find((c) => c.id === lesson.courseId)
        const teacherDetails = store.getData("users").find((u) => u.id === lesson.teacherId)

        return {
          ...lesson,
          className: classDetails?.name || "Unknown Class",
          classColor: classDetails?.color || "#CCCCCC",
          lessonName: lessonDetails?.name || "Unknown Lesson",
          moduleName: moduleDetails?.name || "Unknown Module",
          courseName: courseDetails?.name || "Unknown Course",
          teacherName: teacherDetails
            ? `${teacherDetails.firstName} ${teacherDetails.lastName}`
            : "Unknown Teacher",
          formattedStartTime: new Date(lesson.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          formattedEndTime: lesson.endTime
            ? new Date(lesson.endTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : new Date(new Date(lesson.startTime).getTime() + lesson.duration * 60000).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
        }
      })

      setCurrentLessons(lessonsWithDetails)
    }

    updateLessons()
    const intervalId = setInterval(updateLessons, 30000)

    return () => clearInterval(intervalId)
  }, [store])

  return (
    <div className="p-12">
      <CardContainer className="flex flex-col gap-4 w-full mb-8">
        <h2 className="text-2xl font-bold">Aulas</h2>
        {currentLessons.length === 0 ? (
          <p className="text-muted-foreground">
            As aulas ainda não começaram.
          </p>
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
