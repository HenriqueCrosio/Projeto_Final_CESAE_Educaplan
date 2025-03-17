
import { generateId } from "@/lib/utils/general.utils"
import { useCentralStore } from "@/store/central.store"
import { NotificationService as n } from "@/services/data-services/notification.service"
import { generateSlug, handleServiceErrorWithToast } from "@/lib/utils"
import { type Course, CourseStatusEnum, PublishStatusEnum } from "@/types/interfaces"

class CourseService {
  private static instance: CourseService | null = null
  private teacherId = "cm6bntysq0005s911c7r7o87g"

  private constructor() {}

  static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService()
    }
    return CourseService.instance
  }

  public getTeacherId(): string {
    return this.teacherId
  }

  useCourses = () => useCentralStore((state) => state.getData("courses") || [])

  /**
   * ✅ Adds a course without modules.
   * @param course - Course data.
   * @returns Success or failure message.
   */
  async addCourse(
    course: Omit<Course, "id" | "slug" | "creatorId" | "createdAt" | "updatedAt" | "status" | "publishStatus" >
  ): Promise<{ success: boolean; message: string; course?: Course }> {
    try {
      const state = useCentralStore.getState()
      const courses = state.getData("courses") || []
      const teacherId = this.getTeacherId()

      if (!course.name || !course.category) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.")
      }

      if (courses.some((existingCourse) => existingCourse.name === course.name)) {
        throw new Error("Já existe um curso com este nome.")
      }

      const slug = generateSlug(course.name, "course")

      // ✅ Create course WITHOUT modules
      const newCourse: Course = {
        ...course,
        id: generateId(),
        slug,
        creatorId: teacherId,
        ownedId: [teacherId],
        ownerId: [teacherId],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: CourseStatusEnum.DRAFT,
        publishStatus: PublishStatusEnum.PRIVATE,
      }

      state.addData("courses", newCourse)

      console.log(`Course added:`, newCourse)
      return { success: true, message: "Curso adicionado com sucesso.", course: newCourse }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar o curso")
      return { success: false, message: "Falha ao adicionar o curso" }
    }
  }

  /**
   * ✅ Updates an existing course.
   * @param courseId - The course ID.
   * @param updates - Course updates.
   * @returns Success or failure message.
   */
  async updateCourse(courseId: string, updates: Partial<Course>): Promise<{ success: boolean; message: string; course?: Course }> {
    try {
      const state = useCentralStore.getState()
      const courses = state.getData("courses") || []
      const teacherId = this.getTeacherId()

      const course = courses.find((c) => c.id === courseId)
      if (!course) {
        throw new Error("Curso não encontrado. Atualização cancelada.")
      }

      if (course.creatorId !== teacherId || !course.ownerId?.includes(teacherId)) {
        throw new Error("Você não tem permissão para atualizar este curso.")
      }

      if (course.publishStatus !== PublishStatusEnum.PRIVATE) {
        throw new Error("Apenas cursos com status de publicação privado podem ser atualizados.")
      }

      const updatedCourse = { ...course, ...updates, updatedAt: new Date() }
      state.updateData("courses", courseId, updatedCourse)

      n.addNotification("success", `Curso ${course.name} atualizado com sucesso.`)
      return { success: true, message: "Curso atualizado com sucesso.", course: updatedCourse }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar o curso")
      return { success: false, message: "Falha ao atualizar o curso" }
    }
  }

  /**
   * ✅ Deletes a course.
   * @param courseId - The course ID.
   * @returns Success or failure message.
   */
  async deleteCourse(courseId: string): Promise<{ success: boolean; message: string }> {
    try {
      const state = useCentralStore.getState()
      const courses = state.getData("courses") || []
      const teacherId = this.getTeacherId()

      const course = courses.find((c) => c.id === courseId)
      if (!course) {
        throw new Error("Curso não encontrado. Exclusão cancelada.")
      }

      if (course.creatorId !== teacherId) {
        throw new Error("Você não tem permissão para excluir este curso.")
      }

      if (course.publishStatus !== PublishStatusEnum.PRIVATE) {
        throw new Error("Apenas cursos com status de publicação privado podem ser excluídos.")
      }

      state.deleteData("courses", courseId)

      n.addNotification("success", `Curso ${course.name} excluído com sucesso.`)
      return { success: true, message: "Curso excluído com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao excluir o curso")
      return { success: false, message: "Falha ao excluir o curso" }
    }
  }

  /**
   * ✅ Retrieves a course by slug.
   * @param slug - The course slug.
   * @returns Course object or null.
   */
  getCourseBySlug(slug: string): Course | null {
    try {
      const state = useCentralStore.getState()
      const courses = state.getData("courses") || []
      return courses.find((c) => c.slug === slug) || null
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar o curso")
      return null
    }
  }

  /**
   * ✅ Retrieves courses by category.
   * @param category - The course category.
   * @returns List of courses.
   */
  getCoursesByCategory(category: string): Course[] {
    try {
      const state = useCentralStore.getState()
      const courses = state.getData("courses") || []
      return courses.filter((course) => course.category === category)
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar cursos da categoria")
      return []
    }
  }

  /**
   * ✅ Retrieves all available categories.
   * @returns List of categories.
   */
  getCategories(): string[] {
    try {
      const state = useCentralStore.getState()
      const courses = state.getData("courses") || []
      return Array.from(new Set(courses.map((course) => course.category).filter(Boolean)))
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar as categorias")
      return []
    }
  }

  /**
   * ✅ Retrieves all courses owned or created by the teacher.
   * @returns List of courses.
   */
  getCoursesByTeacher(): Course[] {
    try {
      const teacherId = this.getTeacherId()
      const state = useCentralStore.getState()
      const courses = state.getData("courses") || []

      return courses.filter((course) => course.ownerId?.includes(teacherId))
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os cursos do professor")
      return []
    }
  }
}

export const courseService = CourseService.getInstance()
