import { generateId } from "@/lib/utils/general.utils"
import { useCentralStore } from "@/store/central.store"
import { NotificationService as n } from "@/services/data-services/notification.service"
import { generateSlug, handleServiceErrorWithToast } from "@/lib/utils"
import { Topic, Objective, PublishStatusEnum } from "@/types/interfaces"

class TopicService {
  private static instance: TopicService | null = null
  private teacherId = "cm6bntysq0005s911c7r7o87g" // Hardcoded teacher ID for testing

  private constructor() {}

  static getInstance(): TopicService {
    if (!TopicService.instance) {
      TopicService.instance = new TopicService()
    }
    return TopicService.instance
  }

  public getTeacherId(): string {
    return this.teacherId
  }

  useTopics = () => useCentralStore((state) => state.getData("topics") || [])

  /**
   * ✅ Adds a new topic (CRUD).
   * @param topic - Topic data.
   * @returns Success or failure message.
   */
  async addTopic(
    topic: Omit<Topic, "id" | "slug" | "creatorId" | "ownedId" | "ownerId" | "publishStatus" | "objectives"> & {
      objectives: { description: string }[]
    },
  ): Promise<{ success: boolean; message: string; topic?: Topic }> {
    try {
      const state = useCentralStore.getState()
      const teacherId = this.getTeacherId()

      if (!topic.name || !topic.category) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.")
      }

      const slug = generateSlug(topic.name, "topic")

      const objectivesWithDates: Objective[] = topic.objectives.map((obj) => ({
        id: generateId(),
        description: obj.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      const newTopic: Topic = {
        ...topic,
        id: generateId(),
        slug,
        creatorId: teacherId,
        ownedId: [teacherId],
        ownerId: [teacherId],
        publishStatus: PublishStatusEnum.PRIVATE,
        objectives: objectivesWithDates,
      }

      state.addData("topics", newTopic)

      n.addNotification("success", `Tópico ${topic.name} adicionado com sucesso.`)
      return { success: true, message: "Tópico adicionado com sucesso.", topic: newTopic }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar o tópico")
      return { success: false, message: "Falha ao adicionar o tópico" }
    }
  }

  /**
   * ✅ Updates an existing topic (CRUD).
   * @param topicId - The topic ID.
   * @param updates - Topic updates.
   * @returns Success or failure message.
   */
  async updateTopic(topicId: string, updates: Partial<Topic>): Promise<{ success: boolean; message: string; topic?: Topic }> {
    try {
      const state = useCentralStore.getState()
      const topics = state.getData("topics") || []
      const teacherId = this.getTeacherId()

      const topic = topics.find((t) => t.id === topicId)
      if (!topic) {
        throw new Error("Tópico não encontrado. Atualização cancelada.")
      }

      if (topic.creatorId !== teacherId || !topic.ownerId?.includes(teacherId)) {
        throw new Error("Você não tem permissão para atualizar este tópico.")
      }

      if (topic.publishStatus !== PublishStatusEnum.PRIVATE) {
        throw new Error("Apenas tópicos com status de publicação privado podem ser atualizados.")
      }

      const updatedTopic = { ...topic, ...updates, updatedAt: new Date() }
      state.updateData("topics", topicId, updatedTopic)

      n.addNotification("success", `Tópico ${topic.name} atualizado com sucesso.`)
      return { success: true, message: "Tópico atualizado com sucesso.", topic: updatedTopic }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar o tópico")
      return { success: false, message: "Falha ao atualizar o tópico" }
    }
  }

  /**
   * ✅ Deletes a topic (CRUD).
   * @param topicId - The topic ID.
   * @returns Success or failure message.
   */
  async deleteTopic(topicId: string): Promise<{ success: boolean; message: string }> {
    try {
      const state = useCentralStore.getState()
      const topics = state.getData("topics") || []
      const teacherId = this.getTeacherId()

      const topic = topics.find((t) => t.id === topicId)
      if (!topic) {
        throw new Error("Tópico não encontrado. Exclusão cancelada.")
      }

      if (topic.creatorId !== teacherId) {
        throw new Error("Você não tem permissão para excluir este tópico.")
      }

      if (topic.publishStatus !== PublishStatusEnum.PRIVATE) {
        throw new Error("Apenas tópicos com status de publicação privado podem ser excluídos.")
      }

      state.deleteData("topics", topicId)

      n.addNotification("success", `Tópico ${topic.name} excluído com sucesso.`)
      return { success: true, message: "Tópico excluído com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao excluir o tópico")
      return { success: false, message: "Falha ao excluir o tópico" }
    }
  }

  /**
   * ✅ Retrieves all topics created by the teacher.
   * @returns List of topics.
   */
  getTopicsByTeacher(): Topic[] {
    try {
      const teacherId = this.getTeacherId()
      const state = useCentralStore.getState()
      const topics = state.getData("topics") || []

      return topics.filter((topic) => topic.ownerId?.includes(teacherId))
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os tópicos do professor")
      return []
    }
  }

  /**
   * ✅ Retrieves a topic by slug.
   * @param slug - The topic slug.
   * @returns Topic object or null.
   */
  getTopicBySlug(slug: string): Topic | null {
    try {
      const state = useCentralStore.getState()
      const topics = state.getData("topics") || []

      return topics.find((topic) => topic.slug === slug) || null
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar o tópico")
      return null
    }
  }

  /**
   * ✅ Retrieves a topic by slug.
   * @param slug - The topic slug.
   * @returns Topic object or null.
   */
  getTopicById(id: string): Topic | null {
    try {
      const state = useCentralStore.getState()
      const topics = state.getData("topics") || []

      return topics.find((topic) => topic.id === id) || null
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar o tópico")
      return null
    }
  }
}

export const topicService = TopicService.getInstance()
