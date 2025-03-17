
import { NotificationService as n } from "@/services/data-services/notification.service"
import { handleServiceErrorWithToast } from "@/lib/utils"
import { moduleService } from "@/services/data-services/module.service"
import { moduleTopicService } from "@/services/data-services/module-topic.service"
import { lessonService } from "@/services/data-services/lesson.service"
import { moduleLessonService } from "@/services/data-services/module-lesson.service"
import { type Module, type Topic, type Lesson, CourseStatusEnum } from "@/types/interfaces"
import { topicService } from "../data-services/topic.service"

class ModuleWrapperService {
  private static instance: ModuleWrapperService | null = null
  private teacherId = "cm6bntysq0005s911c7r7o87g" // Hardcoded teacher ID for testing

  private constructor() {}

  static getInstance(): ModuleWrapperService {
    if (!ModuleWrapperService.instance) {
      ModuleWrapperService.instance = new ModuleWrapperService()
    }
    return ModuleWrapperService.instance
  }

  private getTeacherId(): string {
    return this.teacherId
  }

  /**
   * ✅ Creates a module, optionally with topics and generates lessons.
   * @param moduleData - Module details.
   * @param topicIds - (Optional) List of topic IDs.
   * @returns Success or failure message.
   */
  async createModuleWithTopicsAndLessons(
    moduleData: Omit<Module, "id" | "slug" | "creatorId" | "ownedId" | "ownerId" | "createdAt" | "updatedAt" | "publishStatus">,
    topicIds?: string[]
  ): Promise<{ success: boolean; message: string; module?: Module }> {
    try {
      // ✅ Step 1: Create the module without topics or lessons
      const result = await moduleService.addModule(moduleData)

      if (!result.success || !result.module) {
        throw new Error("Falha ao criar o módulo.")
      }

      const newModule = result.module

      // ✅ Step 2: If topics are provided, link them to the module
      if (topicIds && topicIds.length > 0) {
        await Promise.all(
          topicIds.map((topicId) => moduleTopicService.addTopicToModule(newModule.id, topicId))
        )
      }

      // ✅ Step 3: Generate and link lessons
      const { totalMinutes, averageMinutesPerLesson } = moduleData
      if (totalMinutes && averageMinutesPerLesson) {
        const lessonCount = Math.floor(totalMinutes / averageMinutesPerLesson)
        await this.generateLessonsForModule(newModule.id, lessonCount, averageMinutesPerLesson)
      }

      return { success: true, message: "Módulo criado com sucesso.", module: newModule }
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao criar módulo com tópicos e aulas")
      return { success: false, message: "Erro ao criar módulo com tópicos e aulas" }
    }
  }

  /**
   * ✅ Generates lessons based on the total minutes and average lesson duration.
   * @param moduleId - The module ID.
   * @param lessonCount - Number of lessons to create.
   * @param lessonDuration - Duration of each lesson.
   */
  private async generateLessonsForModule(moduleId: string, lessonCount: number, lessonDuration: number) {
    try {
      const lessons: Lesson[] = []
      
      for (let i = 1; i <= lessonCount; i++) {
        const lessonData: Omit<Lesson, "id" | "slug" | "createdAt" | "updatedAt" | "teacherId"> = {
          name: `Aula ${i}`,
          description: `Aula ${i} do módulo.`,
          duration: lessonDuration,
          order: i,
          lectured: false,
          status: CourseStatusEnum.DRAFT
        }

        const newLesson = await lessonService.addLesson(lessonData)

        if (newLesson.success && newLesson.lesson) {
          lessons.push(newLesson.lesson)
          await moduleLessonService.addLessonToModule(moduleId, newLesson.lesson.id)
        }
      }

      n.addNotification("success", `${lessonCount} aulas geradas automaticamente para o módulo.`)
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao gerar aulas para o módulo")
    }
  }

  /**
   * ✅ Updates a module and its associated topics and lessons.
   * @param moduleId - Module ID.
   * @param moduleUpdates - Module updates.
   * @param topicIds - (Optional) Updated list of topic IDs.
   * @returns Success or failure message.
   */
  async updateModuleWithTopicsAndLessons(
    moduleId: string,
    moduleUpdates: Partial<Module>,
    topicIds?: string[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      // ✅ Step 1: Update the module itself
      const updateResult = await moduleService.updateModule(moduleId, moduleUpdates)
      if (!updateResult.success) {
        throw new Error("Falha ao atualizar o módulo.")
      }

      // ✅ Step 2: Update the associated topics
      if (topicIds) {
        const currentTopics = moduleTopicService.getTopicsForModule(moduleId).map((t) => t.id)

        // Remove topics that are no longer selected
        for (const topicId of currentTopics) {
          if (!topicIds.includes(topicId)) {
            await moduleTopicService.removeTopicFromModule(moduleId, topicId)
          }
        }

        // Add new topics
        for (const topicId of topicIds) {
          if (!currentTopics.includes(topicId)) {
            await moduleTopicService.addTopicToModule(moduleId, topicId)
          }
        }
      }

      return { success: true, message: "Módulo, tópicos e aulas atualizados com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao atualizar módulo, tópicos e aulas")
      return { success: false, message: "Erro ao atualizar módulo, tópicos e aulas" }
    }
  }

  /**
   * ✅ Retrieves a module with its linked topics and lessons.
   * @param moduleId - The module ID.
   * @returns Module object with topics and lessons or null.
   */
  getModuleWithTopicsAndLessons(moduleId: string): (Module & { topics: Topic[]; lessons: Lesson[] }) | null {
    try {
        const moduleData = moduleService.getModuleBySlug(moduleId);
        if (!moduleData) {
            throw new Error("Módulo não encontrado.");
        }

        // Obter os tópicos associados ao módulo
        const moduleTopics = moduleTopicService.getTopicsForModule(moduleData.id);
        const topics = moduleTopics
          .map(mt => topicService.getTopicById(mt.id))
          .filter((topic): topic is Topic => topic !== null);

        // Obter as aulas associadas ao módulo
        const moduleLessons = moduleLessonService.getLessonsForModule(moduleData.id);
        const lessons = moduleLessons
          .map(ml => lessonService.getLessonById(ml.id))
          .filter((lesson): lesson is Lesson => lesson !== null);

        return { ...moduleData, topics, lessons };
    } catch (error) {
        handleServiceErrorWithToast(error, "Erro ao recuperar módulo com tópicos e aulas");
        return null;
    }
}


  /**
   * ✅ Deletes a module and removes all associated topics and lessons.
   * @param moduleId - Module ID.
   * @returns Success or failure message.
   */
  async deleteModuleWithTopicsAndLessons(moduleId: string): Promise<{ success: boolean; message: string }> {
    try {
      // ✅ Step 1: Remove all topic associations
      const topics = moduleTopicService.getTopicsForModule(moduleId)
      for (const topic of topics) {
        await moduleTopicService.removeTopicFromModule(moduleId, topic.id)
      }

      // ✅ Step 2: Remove all lesson associations
      const lessons = moduleLessonService.getLessonsForModule(moduleId)
      for (const lesson of lessons) {
        await moduleLessonService.removeLessonFromModule(moduleId, lesson.id)
      }

      // ✅ Step 3: Delete the module
      const deleteResult = await moduleService.deleteModule(moduleId)
      if (!deleteResult.success) {
        throw new Error("Falha ao excluir o módulo.")
      }

      return { success: true, message: "Módulo, tópicos e aulas excluídos com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao excluir módulo com tópicos e aulas")
      return { success: false, message: "Erro ao excluir módulo com tópicos e aulas" }
    }
  }
}

export const moduleWrapperService = ModuleWrapperService.getInstance()
