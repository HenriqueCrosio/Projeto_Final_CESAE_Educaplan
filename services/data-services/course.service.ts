import { useCentralStore } from "@/store/central.store"
import { handleServiceErrorWithToast } from "@/lib/utils"
import { NotificationService as n } from "@/services/data-services/notification.service"
import {
  createCourse,
  getMyCourses,
  getCourseBySlug as getCourseBySlugAction,
  getCourseCategories,
  updateCourse as updateCourseAction,
  deleteCourse as deleteCourseAction,
} from "@/actions/course.actions"
import type { Course } from "@prisma/client"

type AddCourseInput = { name: string; description?: string | null; category: string }
type UpdateCourseInput = { name?: string; description?: string | null; category?: string }

/**
 * CourseService: fonte da verdade = Postgres (via server actions Prisma).
 * Identidade (teacher) e organização vêm SEMPRE da sessão, nunca de constante.
 */
class CourseService {
  private static instance: CourseService | null = null

  private constructor() {}

  static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService()
    }
    return CourseService.instance
  }

  // Hook legado (Zustand) ainda consumido pelo course-module.service enquanto os
  // módulos não são migrados. Será removido quando Module passar para o Postgres.
  useCourses = () => useCentralStore((state) => state.getData("courses") || [])

  async addCourse(
    course: AddCourseInput
  ): Promise<{ success: boolean; message: string; course?: Course }> {
    try {
      if (!course.name || !course.category) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.")
      }
      const created = await createCourse({
        name: course.name,
        description: course.description ?? null,
        category: course.category,
      })
      return { success: true, message: "Curso adicionado com sucesso.", course: created }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar o curso")
      return { success: false, message: "Falha ao adicionar o curso" }
    }
  }

  async updateCourse(
    courseId: string,
    updates: UpdateCourseInput
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await updateCourseAction(courseId, updates)
      if (result.count === 0) {
        throw new Error("Curso não encontrado ou sem permissão para atualizar.")
      }
      n.addNotification("success", "Curso atualizado com sucesso.")
      return { success: true, message: "Curso atualizado com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar o curso")
      return { success: false, message: "Falha ao atualizar o curso" }
    }
  }

  async deleteCourse(courseId: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await deleteCourseAction(courseId)
      if (result.count === 0) {
        throw new Error("Curso não encontrado ou sem permissão para excluir.")
      }
      n.addNotification("success", "Curso excluído com sucesso.")
      return { success: true, message: "Curso excluído com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao excluir o curso")
      return { success: false, message: "Falha ao excluir o curso" }
    }
  }

  async getCourseBySlug(slug: string): Promise<Course | null> {
    try {
      return await getCourseBySlugAction(slug)
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar o curso")
      return null
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      return await getCourseCategories()
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar as categorias")
      return []
    }
  }

  async getCoursesByTeacher(): Promise<Course[]> {
    try {
      return await getMyCourses()
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os cursos do professor")
      return []
    }
  }
}

export const courseService = CourseService.getInstance()
