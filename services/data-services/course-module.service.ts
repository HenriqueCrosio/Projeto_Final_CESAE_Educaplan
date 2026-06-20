import { handleServiceErrorWithToast } from "@/lib/utils"
import { getModulesByCourse } from "@/actions/module.actions"
import type { Module } from "@prisma/client"

/**
 * Opção A: um módulo pertence a um curso (Module.courseId). Não há mais junção N:N.
 * Este serviço apenas resolve "os módulos de um curso" via Postgres.
 */
class CourseModuleService {
  private static instance: CourseModuleService | null = null

  private constructor() {}

  static getInstance(): CourseModuleService {
    if (!CourseModuleService.instance) {
      CourseModuleService.instance = new CourseModuleService()
    }
    return CourseModuleService.instance
  }

  async getModulesForCourse(courseId: string): Promise<Module[]> {
    try {
      return await getModulesByCourse(courseId)
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao recuperar os módulos do curso")
      return []
    }
  }
}

export const courseModuleService = CourseModuleService.getInstance()
