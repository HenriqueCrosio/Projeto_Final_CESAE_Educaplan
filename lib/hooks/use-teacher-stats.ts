import { useState, useEffect } from "react"
import { teacherDashboardService } from "@/services/wrapper-services/teacher.wrapper-service"
import { useCentralStore } from "@/store/central.store"
import type { TeacherStats } from "@/types/interfaces"
import { moduleService } from "@/services/data-services/module.service"
import { lessonService } from "@/services/data-services/lesson.service"

// Hardcoded teacher ID

export const useTeacherStats = () => {
  const [stats, setStats] = useState<TeacherStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const teacherStats = await teacherDashboardService.getTeacherStats()
        setStats({
          ...teacherStats,
          totalModules: moduleService.getModulesByTeacher().length, 
          totalLessons: lessonService.getLessonsByTeacher().length
          
  
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An unknown error occurred"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()

    // Subscribe to changes in the central store
    const unsubscribe = useCentralStore.subscribe(() => {
      fetchStats()
    })

    // Cleanup subscription on unmount
    return () => {
      unsubscribe()
    }
  }, []) // Empty dependency array since we're using a hardcoded ID

  return { stats, isLoading, error }
}

