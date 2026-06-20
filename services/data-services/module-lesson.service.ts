import { handleServiceErrorWithToast } from "@/lib/utils"
import { getLessonsByModule } from "@/actions/lesson.actions"
import type { LessonWithTopics } from "@/services/data-services/lesson.service"

/**
 * Opção A: uma aula pertence a um módulo (Lesson.moduleId). Sem junção N:N.
 * Resolve "as aulas de um módulo" via Postgres.
 */
class ModuleLessonService {
  private static instance: ModuleLessonService | null = null

  private constructor() {}

  static getInstance(): ModuleLessonService {
    if (!ModuleLessonService.instance) {
      ModuleLessonService.instance = new ModuleLessonService()
    }
    return ModuleLessonService.instance
  }

  async getLessonsForModule(moduleId: string): Promise<LessonWithTopics[]> {
    try {
      return await getLessonsByModule(moduleId)
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao recuperar as aulas do módulo")
      return []
    }
  }
}

export const moduleLessonService = ModuleLessonService.getInstance()
