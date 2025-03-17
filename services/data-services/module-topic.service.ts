import { generateId } from "@/lib/utils/general.utils"
import { useCentralStore } from "@/store/central.store"
import { NotificationService as n } from "@/services/data-services/notification.service"
import { handleServiceErrorWithToast } from "@/lib/utils"
import type { ModuleTopic, Topic, Module } from "@/types/interfaces"

class ModuleTopicService {
  private static instance: ModuleTopicService | null = null
  private teacherId = "cm6bntysq0005s911c7r7o87g" // Hardcoded teacher ID for testing

  private constructor() {}

  static getInstance(): ModuleTopicService {
    if (!ModuleTopicService.instance) {
      ModuleTopicService.instance = new ModuleTopicService()
    }
    return ModuleTopicService.instance
  }

  private getTeacherId(): string {
    return this.teacherId
  }

  useModuleTopics = () => useCentralStore((state) => state.getData("moduleTopics") || [])

  /**
   * ✅ Adds a topic to a module (CRUD).
   * @param moduleId - The module ID.
   * @param topicId - The topic ID.
   * @returns Success or failure message.
   */
  async addTopicToModule(moduleId: string, topicId: string): Promise<{ success: boolean; message: string }> {
    try {
      const state = useCentralStore.getState()
      const moduleTopics = state.getData("moduleTopics") || []

      if (moduleTopics.some((mt) => mt.moduleId === moduleId && mt.topicId === topicId)) {
        throw new Error("Este tópico já está associado a este módulo.")
      }

      const newModuleTopic: ModuleTopic = {
        id: generateId(),
        moduleId,
        topicId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      state.addData("moduleTopics", newModuleTopic)

      n.addNotification("success", "Tópico adicionado ao módulo com sucesso.")
      return { success: true, message: "Tópico adicionado ao módulo com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar o tópico ao módulo")
      return { success: false, message: "Falha ao adicionar o tópico ao módulo" }
    }
  }

  /**
   * ✅ Removes a topic from a module (CRUD).
   * @param moduleId - The module ID.
   * @param topicId - The topic ID.
   * @returns Success or failure message.
   */
  async removeTopicFromModule(moduleId: string, topicId: string): Promise<{ success: boolean; message: string }> {
    try {
      const state = useCentralStore.getState()
      const moduleTopics = state.getData("moduleTopics") || []

      const moduleTopic = moduleTopics.find((mt) => mt.moduleId === moduleId && mt.topicId === topicId)

      if (!moduleTopic) {
        throw new Error("Associação entre tópico e módulo não encontrada.")
      }

      state.deleteData("moduleTopics", moduleTopic.id)

      n.addNotification("success", "Tópico removido do módulo com sucesso.")
      return { success: true, message: "Tópico removido do módulo com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao remover o tópico do módulo")
      return { success: false, message: "Falha ao remover o tópico do módulo" }
    }
  }

  /**
   * ✅ Retrieves topics associated with a module.
   * @param moduleId - The module ID.
   * @returns List of topics.
   */
  getTopicsForModule(moduleId: string): Topic[] {
    try {
      const state = useCentralStore.getState()
      const moduleTopics = state.getData("moduleTopics") || []
      const topics = state.getData("topics") || []

      const topicIds = moduleTopics.filter((mt) => mt.moduleId === moduleId).map((mt) => mt.topicId)

      return topics.filter((topic) => topicIds.includes(topic.id))
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os tópicos do módulo")
      return []
    }
  }

  /**
   * ✅ Retrieves modules associated with a topic.
   * @param topicId - The topic ID.
   * @returns List of modules.
   */
  getModulesForTopic(topicId: string): Module[] {
    try {
      const state = useCentralStore.getState()
      const moduleTopics = state.getData("moduleTopics") || []
      const modules = state.getData("modules") || []

      const moduleIds = moduleTopics.filter((mt) => mt.topicId === topicId).map((mt) => mt.moduleId)

      return modules.filter((module) => moduleIds.includes(module.id))
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os módulos do tópico")
      return []
    }
  }

  /**
   * ✅ Updates the order of topics in a module.
   * @param moduleId - The module ID.
   * @param newOrder - Array of topic IDs in the new order.
   * @returns Success or failure message.
   */
  async updateTopicOrder(moduleId: string, newOrder: string[]): Promise<{ success: boolean; message: string }> {
    try {
      const state = useCentralStore.getState()
      const moduleTopics = state.getData("moduleTopics") || []

      const topicsInModule = moduleTopics.filter((mt) => mt.moduleId === moduleId)

      if (topicsInModule.length !== newOrder.length) {
        throw new Error("A nova ordem não corresponde ao número de tópicos no módulo.")
      }

      newOrder.forEach((topicId, index) => {
        const moduleTopic = topicsInModule.find((mt) => mt.topicId === topicId)
        if (moduleTopic) {
          state.updateData("moduleTopics", moduleTopic.id, {
            ...moduleTopic,
            updatedAt: new Date(Date.now() + index),
          })
        }
      })

      n.addNotification("success", "Ordem dos tópicos atualizada com sucesso.")
      return { success: true, message: "Ordem dos tópicos atualizada com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar a ordem dos tópicos")
      return { success: false, message: "Falha ao atualizar a ordem dos tópicos" }
    }
  }
}

export const moduleTopicService = ModuleTopicService.getInstance()

