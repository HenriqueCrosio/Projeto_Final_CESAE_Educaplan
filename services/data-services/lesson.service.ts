import { generateId } from "@/lib/utils/general.utils"
import { useCentralStore } from "@/store/central.store"
import { NotificationService as n } from "@/services/data-services/notification.service"
import { generateSlug, handleServiceErrorWithToast } from "@/lib/utils"
import { CourseStatusEnum, type Lesson } from "@/types/interfaces"

class LessonService {
  private static instance: LessonService | null = null
  private teacherId = "cm6bntysq0005s911c7r7o87g" // Hardcoded teacher ID for testing

  private constructor() {}

  static getInstance(): LessonService {
    if (!LessonService.instance) {
      LessonService.instance = new LessonService()
    }
    return LessonService.instance
  }

  public getTeacherId(): string {
    return this.teacherId
  }

  useLessons = () => useCentralStore((state) => state.getData("lessons") || [])

  /**
   * ✅ Adds a new lesson (CRUD).
   * @param lesson - Lesson data.
   * @returns Success or failure message.
   */
  async addLesson(lesson: Omit<Lesson, "id" | "slug" | "createdAt" | "status" | "updatedAt" | "teacherId">): Promise<{ success: boolean; message: string; lesson?: Lesson }> {
    try {
      const state = useCentralStore.getState()
      const teacherId = this.getTeacherId()

      if (!lesson.name || lesson.order === undefined) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.")
      }

      const slug = generateSlug(lesson.name, "lesson")

      const newLesson: Lesson = {
        ...lesson,
        id: generateId(),
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
        teacherId,
        status: CourseStatusEnum.DRAFT,
      }

      state.addData("lessons", newLesson)

      n.addNotification("success", "Aula criada com sucesso.")
      return { success: true, message: "Aula criada com sucesso.", lesson: newLesson }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao criar a aula")
      return { success: false, message: "Falha ao criar a aula" }
    }
  }

  /**
   * ✅ Updates an existing lesson (CRUD).
   * @param lessonId - The lesson ID.
   * @param updates - Lesson updates.
   * @returns Success or failure message.
   */
  async updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<{ success: boolean; message: string; lesson?: Lesson }> {
    try {
      const state = useCentralStore.getState()
      const lessons = state.getData("lessons") || []
      const teacherId = this.getTeacherId()

      const lessonData = lessons.find((l) => l.id === lessonId)
      if (!lessonData) {
        throw new Error("Aula não encontrada. Atualização cancelada.")
      }

      if (lessonData.teacherId !== teacherId) {
        throw new Error("Você não tem permissão para atualizar esta aula.")
      }

      const updatedLesson = { ...lessonData, ...updates, updatedAt: new Date() }
      state.updateData("lessons", lessonId, updatedLesson)

      n.addNotification("success", "Aula atualizada com sucesso.")
      return { success: true, message: "Aula atualizada com sucesso.", lesson: updatedLesson }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar a aula")
      return { success: false, message: "Falha ao atualizar a aula" }
    }
  }

  /**
   * ✅ Deletes a lesson (CRUD).
   * @param lessonId - The lesson ID.
   * @returns Success or failure message.
   */
  async deleteLesson(lessonId: string): Promise<{ success: boolean; message: string }> {
    try {
      const state = useCentralStore.getState()
      const lessons = state.getData("lessons") || []
      const teacherId = this.getTeacherId()

      const lessonData = lessons.find((l) => l.id === lessonId)
      if (!lessonData) {
        throw new Error("Aula não encontrada. Exclusão cancelada.")
      }

      if (lessonData.teacherId !== teacherId) {
        throw new Error("Você não tem permissão para excluir esta aula.")
      }

      state.deleteData("lessons", lessonId)

      n.addNotification("success", "Aula excluída com sucesso.")
      return { success: true, message: "Aula excluída com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao excluir a aula")
      return { success: false, message: "Falha ao excluir a aula" }
    }
  }

  /**
   * ✅ Retrieves a lesson by its ID.
   * @param lessonId - The lesson ID.
   * @returns Lesson object or null.
   */
  getLessonById(lessonId: string): Lesson | null {
    try {
      const state = useCentralStore.getState()
      const lessons = state.getData("lessons") || []
      return lessons.find((l) => l.id === lessonId) || null
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar a aula")
      return null
    }
  }

  /**
   * ✅ Retrieves all lessons created by the teacher.
   * @returns List of lessons.
   */
  getLessonsByTeacher(): Lesson[] {
    try {
      const teacherId = this.getTeacherId()
      const state = useCentralStore.getState()
      const lessons = state.getData("lessons") || []

      return lessons.filter((lesson) => lesson.teacherId === teacherId)
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar as aulas do professor")
      return []
    }
  }

  /**
   * ✅ Retrieves a lesson by slug.
   * @param slug - The lesson slug.
   * @returns Lesson object or null.
   */
  getLessonBySlug(slug: string): Lesson | null {
    try {
      const state = useCentralStore.getState()
      const lessons = state.getData("lessons") || []
      return lessons.find((l) => l.slug === slug) || null
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar a aula")
      return null
    }
  }
}

export const lessonService = LessonService.getInstance()
