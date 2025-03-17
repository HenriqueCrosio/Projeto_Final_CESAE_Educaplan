import type { Course, User, ClassScheduleLessons, Enrollment } from "@/types/interfaces"
import { useCentralStore } from "@/store/central.store"

export class TeacherDashboardService {
  private static instance: TeacherDashboardService
  private store: ReturnType<typeof useCentralStore.getState>
  private teacherId = "cm6bntysq0005s911c7r7o87g"; 

  private constructor() {
    this.store = useCentralStore.getState()

    useCentralStore.subscribe((state) => {
      this.store = state
    })
  }

  private getTeacherId(): string {
    return this.teacherId;
  }

  public static getInstance(): TeacherDashboardService {
    if (!TeacherDashboardService.instance) {
      TeacherDashboardService.instance = new TeacherDashboardService()
    }
    return TeacherDashboardService.instance
  }

    public getTeacherStats() {
    const teacherId = this.getTeacherId();
    const courses = this.getTeacherCourses(teacherId)
    const students = this.getTeacherStudents(teacherId)
    const scheduledLessons = this.getTeacherScheduledLessons()
    const enrollments = this.getTeacherEnrollments(teacherId)

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

  private getTeacherCourses(teacherId: string): Course[] {
    return this.store.data.courses.filter((course: Course) => course.ownerId.includes(teacherId))
  }

  private getTeacherStudents(teacherId: string): User[] {
    const teacherClassIds = this.store.data.classes
      .filter((cls: any) => cls.teacherId === teacherId)
      .map((cls: any) => cls.id)

    const studentIds = this.store.data.classStudents
      .filter((cs: any) => teacherClassIds.includes(cs.classId))
      .map((cs: any) => cs.studentId)

    return this.store.data.users.filter((user: User) => studentIds.includes(user.id))
  }

  public getTeacherScheduledLessons(): ClassScheduleLessons[] {
    const teacherId = this.getTeacherId();
    return this.store.data.classScheduleLessons.filter((lesson: ClassScheduleLessons) => lesson.teacherId === teacherId)
  }

  private getTeacherEnrollments(teacherId: string): Enrollment[] {
    return this.store.data.enrollments.filter((enrollment: Enrollment) => enrollment.teacherId === teacherId)
  }

  private getUpcomingLessons(scheduledLessons: ClassScheduleLessons[], limit: number): ClassScheduleLessons[] {
    const now = new Date()
    return scheduledLessons
      .filter((lesson) => new Date(lesson.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, limit)
  }

  private calculateCourseCompletionRates(courses: Course[], enrollments: Enrollment[]): { [courseId: string]: number } {
    const completionRates: { [courseId: string]: number } = {}
    courses.forEach((course) => {
      const courseEnrollments = enrollments.filter((e) => e.courseId === course.id)
      const completedEnrollments = courseEnrollments.filter((e) => new Date(e.endDate) < new Date())
      completionRates[course.id] =
        courseEnrollments.length > 0 ? (completedEnrollments.length / courseEnrollments.length) * 100 : 0
    })
    return completionRates
  }

  private calculateAverageLessonDuration(lessons: ClassScheduleLessons[]): number {
    const totalDuration = lessons.reduce((sum, lesson) => {
      if (!lesson.startTime || !lesson.endTime) return sum
      const start = new Date(lesson.startTime)
      const end = new Date(lesson.endTime)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60) // Convert to minutes
    }, 0)
    return lessons.length > 0 ? totalDuration / lessons.length : 0
  }

  private getMostPopularCourse(courses: Course[], enrollments: Enrollment[]): Course | null {
    const courseCounts = courses.map((course) => ({
      course,
      count: enrollments.filter((e) => e.courseId === course.id).length,
    }))
    const mostPopular = courseCounts.reduce(
      (max, current) => (current.count > max.count ? current : max),
      courseCounts[0],
    )
    return mostPopular ? mostPopular.course : null
  }
}

export const teacherDashboardService = TeacherDashboardService.getInstance()

