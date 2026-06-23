"use client"

import type React from "react"
import { useTeacherStats } from "@/lib/hooks/use-teacher-stats"
import { StatCard } from "./stats-card"
import { UpcomingLessons } from "./upcoming"
//import { CourseCompletionRates } from "./course-completion-ratee"
import { MostPopularCourse } from "./most-popular-course"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { minutesToHours } from "@/lib/utils"

export const TeacherDashboard: React.FC = () => {
  const { stats, isLoading, error } = useTeacherStats()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load dashboard data. Please try again later.</AlertDescription>
      </Alert>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard title="Cursos" value={stats.totalCourses} />
      <StatCard title="Módulos" value={stats.totalModules} />
      <StatCard title="Aulas" value={stats.totalLessons} />
      <StatCard title="Matrículas" value={stats.totalEnrollments} />
      <StatCard title="Alunos" value={stats.totalStudents} />
      <StatCard title="Duração média da aula" value={`${minutesToHours(stats.averageLessonDuration)} horas`} />
      <UpcomingLessons lessons={stats.upcomingLessons} />
      {stats.mostPopularCourse && <MostPopularCourse course={stats.mostPopularCourse} />}
    </div>
  )
}

const DashboardSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <Skeleton key={i} className="h-[100px]" />
    ))}
    <Skeleton className="h-[200px] col-span-full" />
    <Skeleton className="h-[200px] col-span-full" />
    <Skeleton className="h-[100px] col-span-full" />
  </div>
)

export default TeacherDashboard

