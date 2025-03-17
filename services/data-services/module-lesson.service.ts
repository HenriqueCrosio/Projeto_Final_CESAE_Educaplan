import { generateId } from "@/lib/utils/general.utils"
import { useCentralStore } from "@/store/central.store"
import { NotificationService as n } from "@/services/data-services/notification.service"
import { handleServiceErrorWithToast } from "@/lib/utils"
import type { ModuleLesson, Lesson } from "@/types/interfaces"

class ModuleLessonService {
  private static instance: ModuleLessonService | null = null
  private teacherId = "cm6bntysq0005s911c7r7o87g" // Hardcoded teacher ID for testing

  private constructor() {}

  static getInstance(): ModuleLessonService {
    if (!ModuleLessonService.instance) {
      ModuleLessonService.instance = new ModuleLessonService()
    }
    return ModuleLessonService.instance
  }

  private getTeacherId(): string {
    return this.teacherId
  }

  useModuleLessons = () => useCentralStore((state) => state.getData("moduleLessons") || [])

  /**
   * ✅ Adds a lesson to a module (CRUD).
   * @param moduleId - The module ID.
   * @param lessonId - The lesson ID.
   * @returns Success or failure message.
   */
  async addLessonToModule(moduleId: string, lessonId: string): Promise<{ success: boolean; message: string; moduleLesson?: ModuleLesson }> {
    try {
      const state = useCentralStore.getState()
      const teacherId = this.getTeacherId()

      const newModuleLesson: ModuleLesson = {
        id: generateId(),
        moduleId,
        lessonId,
        lectured: false,
        teacherId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      state.addData("moduleLessons", newModuleLesson)

      n.addNotification("success", "Aula adicionada ao módulo com sucesso.")
      return { success: true, message: "Aula adicionada ao módulo com sucesso.", moduleLesson: newModuleLesson }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar a aula ao módulo")
      return { success: false, message: "Falha ao adicionar a aula ao módulo" }
    }
  }

  /**
   * ✅ Removes a lesson from a module (CRUD).
   * @param moduleId - The module ID.
   * @param lessonId - The lesson ID.
   * @returns Success or failure message.
   */
  async removeLessonFromModule(moduleId: string, lessonId: string): Promise<{ success: boolean; message: string }> {
    try {
      const state = useCentralStore.getState()
      const moduleLessons = state.getData("moduleLessons") || []
      const teacherId = this.getTeacherId()

      const moduleLesson = moduleLessons.find((ml) => ml.moduleId === moduleId && ml.lessonId === lessonId && ml.teacherId === teacherId)

      if (!moduleLesson) {
        throw new Error("Associação entre aula e módulo não encontrada ou você não tem permissão para removê-la.")
      }

      state.deleteData("moduleLessons", moduleLesson.id)

      n.addNotification("success", "Aula removida do módulo com sucesso.")
      return { success: true, message: "Aula removida do módulo com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao remover a aula do módulo")
      return { success: false, message: "Falha ao remover a aula do módulo" }
    }
  }

  /**
   * ✅ Retrieves lessons associated with a module.
   * @param moduleId - The module ID.
   * @returns List of lessons.
   */
  getLessonsForModule(moduleId: string): Lesson[] {
    try {
      const state = useCentralStore.getState()
      const moduleLessons = state.getData("moduleLessons") || []
      const lessons = state.getData("lessons") || []

      const lessonIds = moduleLessons.filter((ml) => ml.moduleId === moduleId).map((ml) => ml.lessonId)

      return lessons.filter((lesson) => lessonIds.includes(lesson.id))
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar as aulas do módulo")
      return []
    }
  }

  /**
   * ✅ Retrieves modules associated with a lesson.
   * @param lessonId - The lesson ID.
   * @returns List of modules.
   */
  getModulesForLesson(lessonId: string): string[] {
    try {
      const state = useCentralStore.getState()
      const moduleLessons = state.getData("moduleLessons") || []

      return moduleLessons.filter((ml) => ml.lessonId === lessonId).map((ml) => ml.moduleId)
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os módulos da aula")
      return []
    }
  }

  /**
   * ✅ Updates the order of lessons in a module.
   * @param moduleId - The module ID.
   * @param newOrder - Array of lesson IDs in the new order.
   * @returns Success or failure message.
   */
  async updateLessonOrder(moduleId: string, newOrder: string[]): Promise<{ success: boolean; message: string }> {
    try {
      const state = useCentralStore.getState()
      const moduleLessons = state.getData("moduleLessons") || []
      const teacherId = this.getTeacherId()

      const lessonsInModule = moduleLessons.filter((ml) => ml.moduleId === moduleId && ml.teacherId === teacherId)

      if (lessonsInModule.length !== newOrder.length) {
        throw new Error("A nova ordem não corresponde ao número de aulas no módulo.")
      }

      newOrder.forEach((lessonId) => {
        const moduleLesson = lessonsInModule.find((ml) => ml.lessonId === lessonId)
        if (moduleLesson) {
          state.updateData("moduleLessons", moduleLesson.id, {
            ...moduleLesson,
            updatedAt: new Date(),
          })
        }
      })

      n.addNotification("success", "Ordem das aulas atualizada com sucesso.")
      return { success: true, message: "Ordem das aulas atualizada com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar a ordem das aulas")
      return { success: false, message: "Falha ao atualizar a ordem das aulas" }
    }
  }

  /**
   * ✅ Updates the lectured status of a lesson.
   * @param moduleId - The module ID.
   * @param lessonId - The lesson ID.
   * @param lectured - Whether the lesson has been lectured.
   * @returns Success or failure message.
   */
  async updateLessonLecturedStatus(moduleId: string, lessonId: string, lectured: boolean): Promise<{ success: boolean; message: string }> {
    try {
      const state = useCentralStore.getState()
      const moduleLessons = state.getData("moduleLessons") || []
      const teacherId = this.getTeacherId()

      const moduleLesson = moduleLessons.find((ml) => ml.moduleId === moduleId && ml.lessonId === lessonId && ml.teacherId === teacherId)

      if (!moduleLesson) {
        throw new Error("Associação entre aula e módulo não encontrada ou você não tem permissão para atualizá-la.")
      }

      state.updateData("moduleLessons", moduleLesson.id, {
        ...moduleLesson,
        lectured,
        updatedAt: new Date(),
      })

      n.addNotification("success", `Status da aula atualizado para ${lectured ? "lecionada" : "não lecionada"}.`)
      return { success: true, message: `Status da aula atualizado para ${lectured ? "lecionada" : "não lecionada"}.` }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar o status da aula")
      return { success: false, message: "Falha ao atualizar o status da aula" }
    }
  }
}

export const moduleLessonService = ModuleLessonService.getInstance()
