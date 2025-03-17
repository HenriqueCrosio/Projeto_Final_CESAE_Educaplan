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
import { AcademicCapIcon, UserGroupIcon } from "@heroicons/react/24/outline"
import { Card } from "@/components/ui/card"

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
      <StatCard title="Total Courses" value={stats.totalCourses} />
      <StatCard title="Total Modules" value={stats.totalModules} />
      <StatCard title="Total Lessons" value={stats.totalLessons} />
      <StatCard title="Total Enrollments" value={stats.totalEnrollments} />
      <StatCard title="Total Students" value={stats.totalStudents} />
      <StatCard title="Average Lesson Duration" value={`${minutesToHours(stats.averageLessonDuration)} horas`} />
      <UpcomingLessons lessons={stats.upcomingLessons} />
      {stats.mostPopularCourse && <MostPopularCourse course={stats.mostPopularCourse} />}
      <Card className="col-span-3 p-6 ">
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center">
              <AcademicCapIcon className="h-6 w-6 mr-2 text-blue-500" />
              <span>Desenvolvimento Web Full Stack</span>
            </div>
            <div className="flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-1 text-gray-500" />
              <span>25 alunos</span>
            </div>
          </div>
          <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
            <div className="flex items-center">
              <AcademicCapIcon className="h-6 w-6 mr-2 text-green-500" />
              <span>Design Gráfico Avançado</span>
            </div>
            <div className="flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-1 text-gray-500" />
              <span>18 alunos</span>
            </div>
          </div>
          <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center">
              <AcademicCapIcon className="h-6 w-6 mr-2 text-purple-500" />
              <span>Marketing Digital</span>
            </div>
            <div className="flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-1 text-gray-500" />
              <span>30 alunos</span>
            </div>
          </div>
        </div>
      </Card>
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

