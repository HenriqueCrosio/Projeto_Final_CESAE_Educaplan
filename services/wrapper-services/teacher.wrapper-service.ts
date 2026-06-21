import type { Course } from "@prisma/client"
import { courseService } from "@/services/data-services/course.service"
import { getMyStudents } from "@/actions/student.actions"
import { getMyEnrollments } from "@/actions/enrollment.actions"
import { getMySchedules } from "@/actions/schedule.actions"

type Enrollment = Awaited<ReturnType<typeof getMyEnrollments>>[number]
type Schedule = Awaited<ReturnType<typeof getMySchedules>>[number]

export class TeacherDashboardService {
  private static instance: TeacherDashboardService

  private constructor() {}

  public static getInstance(): TeacherDashboardService {
    if (!TeacherDashboardService.instance) {
      TeacherDashboardService.instance = new TeacherDashboardService()
    }
    return TeacherDashboardService.instance
  }

  public async getTeacherScheduledLessons(): Promise<Schedule[]> {
    return getMySchedules()
  }

  public async getTeacherStats() {
    // Tudo do Postgres (org + professor da sessão).
    const [courses, students, enrollments, scheduledLessons] = await Promise.all([
      courseService.getCoursesByTeacher(),
      getMyStudents(),
      getMyEnrollments(),
      getMySchedules(),
    ])

    return {
      totalCourses: courses.length,
      totalStudents: students.length,
      totalScheduledLessons: scheduledLessons.length,
      totalEnrollments: enrollments.length,
      upcomingLessons: this.getUpcomingLessons(scheduledLessons, 5),
      courseCompletionRates: this.calculateCourseCompletionRates(courses, enrollments),
      averageLessonDuration: this.calculateAverageLessonDuration(scheduledLessons),
      mostPopularCourse: this.getMostPopularCourse(courses, enrollments),
    }
  }

  private getUpcomingLessons(scheduledLessons: Schedule[], limit: number) {
    const now = new Date()
    return scheduledLessons
      .filter((s) => new Date(s.dateTime) > now)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .slice(0, limit)
      .map((s) => ({ id: s.lesson.name, name: s.lesson.name, startTime: s.dateTime }))
  }

  private calculateCourseCompletionRates(
    courses: Course[],
    enrollments: Enrollment[]
  ): { [courseId: string]: number } {
    const completionRates: { [courseId: string]: number } = {}
    const now = new Date()
    courses.forEach((course) => {
      const courseEnrollments = enrollments.filter((e) => e.courseId === course.id)
      const completed = courseEnrollments.filter((e) => new Date(e.endDate) < now)
      completionRates[course.id] =
        courseEnrollments.length > 0 ? (completed.length / courseEnrollments.length) * 100 : 0
    })
    return completionRates
  }

  private calculateAverageLessonDuration(scheduledLessons: Schedule[]): number {
    if (scheduledLessons.length === 0) return 0
    const total = scheduledLessons.reduce((sum, s) => sum + (s.duration || 0), 0)
    return total / scheduledLessons.length
  }

  private getMostPopularCourse(courses: Course[], enrollments: Enrollment[]): Course | null {
    if (courses.length === 0) return null
    const counts = courses.map((course) => ({
      course,
      count: enrollments.filter((e) => e.courseId === course.id).length,
    }))
    const mostPopular = counts.reduce((max, current) => (current.count > max.count ? current : max), counts[0])
    return mostPopular ? mostPopular.course : null
  }
}

export const teacherDashboardService = TeacherDashboardService.getInstance()
