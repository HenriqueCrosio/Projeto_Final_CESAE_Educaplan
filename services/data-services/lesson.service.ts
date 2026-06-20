import { NotificationService as n } from "@/services/data-services/notification.service"
import { handleServiceErrorWithToast } from "@/lib/utils"
import {
  createLesson,
  updateLesson as updateLessonAction,
  getMyLessons,
  deleteLesson as deleteLessonAction,
  type CreateLessonInput,
} from "@/actions/lesson.actions"
import type { Lesson as PrismaLesson, Topic, CourseStatusEnum } from "@prisma/client"

export type LessonWithTopics = PrismaLesson & { topics: Topic[] }

type UpdateLessonInput = {
  name?: string
  description?: string | null
  duration?: number
  order?: number
  status?: CourseStatusEnum
  topicIds?: string[]
}

/**
 * LessonService: fonte da verdade = Postgres. Uma aula pertence a um módulo (Opção A)
 * e pode cobrir vários tópicos (M:N Lesson↔Topic).
 */
class LessonService {
  private static instance: LessonService | null = null

  private constructor() {}

  static getInstance(): LessonService {
    if (!LessonService.instance) {
      LessonService.instance = new LessonService()
    }
    return LessonService.instance
  }

  async addLesson(
    lesson: CreateLessonInput
  ): Promise<{ success: boolean; message: string; lesson?: LessonWithTopics }> {
    try {
      const created = await createLesson(lesson)
      n.addNotification("success", "Aula criada com sucesso.")
      return { success: true, message: "Aula criada com sucesso.", lesson: created }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao criar a aula")
      return { success: false, message: "Falha ao criar a aula" }
    }
  }

  async updateLesson(
    lessonId: string,
    updates: UpdateLessonInput
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await updateLessonAction(lessonId, updates)
      if (result.count === 0) {
        throw new Error("Aula não encontrada ou sem permissão para atualizar.")
      }
      n.addNotification("success", "Aula atualizada com sucesso.")
      return { success: true, message: "Aula atualizada com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar a aula")
      return { success: false, message: "Falha ao atualizar a aula" }
    }
  }

  async deleteLesson(lessonId: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await deleteLessonAction(lessonId)
      if (result.count === 0) {
        throw new Error("Aula não encontrada ou sem permissão para excluir.")
      }
      n.addNotification("success", "Aula excluída com sucesso.")
      return { success: true, message: "Aula excluída com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao excluir a aula")
      return { success: false, message: "Falha ao excluir a aula" }
    }
  }

  async getLessonsByTeacher(): Promise<{ id: string }[]> {
    try {
      return await getMyLessons()
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar as aulas do professor")
      return []
    }
  }
}

export const lessonService = LessonService.getInstance()
