import { NotificationService as n } from "@/services/data-services/notification.service"
import { handleServiceErrorWithToast } from "@/lib/utils"
import {
  createTopic,
  getMyTopics,
  getTopicsByModule,
  getTopicById as getTopicByIdAction,
  updateTopic as updateTopicAction,
  deleteTopic as deleteTopicAction,
  type CreateTopicInput,
} from "@/actions/topic.actions"
import type { Topic as PrismaTopic, Objective } from "@prisma/client"

export type TopicWithObjectives = PrismaTopic & { objectives: Objective[] }
export type TopicListItem = TopicWithObjectives & { module: { name: string } | null }

/**
 * TopicService: fonte da verdade = Postgres. Um tópico pertence a um módulo (Opção A).
 */
class TopicService {
  private static instance: TopicService | null = null

  private constructor() {}

  static getInstance(): TopicService {
    if (!TopicService.instance) {
      TopicService.instance = new TopicService()
    }
    return TopicService.instance
  }

  async addTopic(
    topic: CreateTopicInput
  ): Promise<{ success: boolean; message: string; topic?: TopicWithObjectives }> {
    try {
      const created = await createTopic(topic)
      n.addNotification("success", `Tópico ${created.name} adicionado com sucesso.`)
      return { success: true, message: "Tópico adicionado com sucesso.", topic: created }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar o tópico")
      return { success: false, message: "Falha ao adicionar o tópico" }
    }
  }

  async updateTopic(
    topicId: string,
    updates: { name?: string; description?: string | null }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await updateTopicAction(topicId, updates)
      if (result.count === 0) {
        throw new Error("Tópico não encontrado ou sem permissão para atualizar.")
      }
      n.addNotification("success", "Tópico atualizado com sucesso.")
      return { success: true, message: "Tópico atualizado com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar o tópico")
      return { success: false, message: "Falha ao atualizar o tópico" }
    }
  }

  async deleteTopic(topicId: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await deleteTopicAction(topicId)
      if (result.count === 0) {
        throw new Error("Tópico não encontrado ou sem permissão para excluir.")
      }
      n.addNotification("success", "Tópico excluído com sucesso.")
      return { success: true, message: "Tópico excluído com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao excluir o tópico")
      return { success: false, message: "Falha ao excluir o tópico" }
    }
  }

  async getTopicsByTeacher(): Promise<TopicListItem[]> {
    try {
      return await getMyTopics()
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os tópicos do professor")
      return []
    }
  }

  async getTopicsForModule(moduleId: string): Promise<TopicWithObjectives[]> {
    try {
      return await getTopicsByModule(moduleId)
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os tópicos do módulo")
      return []
    }
  }

  async getTopicById(id: string): Promise<TopicListItem | null> {
    try {
      return await getTopicByIdAction(id)
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar o tópico")
      return null
    }
  }
}

export const topicService = TopicService.getInstance()
