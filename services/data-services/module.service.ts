import { generateId } from "@/lib/utils/general.utils"
import { useCentralStore } from "@/store/central.store"
import { NotificationService as n } from "@/services/data-services/notification.service"
import { generateSlug, handleServiceErrorWithToast } from "@/lib/utils"
import { type Module, PublishStatusEnum } from "@/types/interfaces"

class ModuleService {
  private static instance: ModuleService | null = null
  private teacherId = "cm6bntysq0005s911c7r7o87g" // Hardcoded teacher ID for testing

  private constructor() {}

  static getInstance(): ModuleService {
    if (!ModuleService.instance) {
      ModuleService.instance = new ModuleService()
    }
    return ModuleService.instance
  }

  public getTeacherId(): string {
    return this.teacherId
  }

  useModules = () => useCentralStore((state) => state.getData("modules") || [])

  /**
   * ✅ Adds a new module (CRUD).
   * @param module - Module data.
   * @returns Success or failure message.
   */
  async addModule(
    module: Omit<Module, "id" | "slug" | "creatorId" | "ownedId" | "ownerId" | "createdAt" | "updatedAt" | "publishStatus" | "lessonCount">
  ): Promise<{ success: boolean; message: string; module?: Module }> {
    try {
      const state = useCentralStore.getState()
      const modules = state.getData("modules") || []
      const teacherId = this.getTeacherId()

      if (!module.name || !module.category || !module.totalMinutes || !module.averageMinutesPerLesson) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.")
      }

      if (modules.some((existingModule) => existingModule.name === module.name)) {
        throw new Error("Já existe um módulo com este nome.")
      }

      const slug = generateSlug(module.name, "module")

      const newModule: Module = {
        ...module,
        id: generateId(),
        slug,
        creatorId: teacherId,
        ownedId: [teacherId],
        ownerId: [teacherId],
        createdAt: new Date(),
        updatedAt: new Date(),
        publishStatus: PublishStatusEnum.PRIVATE,
      }

      state.addData("modules", newModule)

      n.addNotification("success", `Módulo ${module.name} adicionado com sucesso.`)
      return { success: true, message: "Módulo adicionado com sucesso.", module: newModule }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar o módulo")
      return { success: false, message: "Falha ao adicionar o módulo" }
    }
  }

  /**
   * ✅ Updates an existing module (CRUD).
   * @param moduleId - The module ID.
   * @param updates - Module updates.
   * @returns Success or failure message.
   */
  async updateModule(moduleId: string, updates: Partial<Module>): Promise<{ success: boolean; message: string; module?: Module }> {
    try {
      const state = useCentralStore.getState()
      const modules = state.getData("modules") || []
      const teacherId = this.getTeacherId()

      const moduleData = modules.find((m) => m.id === moduleId)
      if (!moduleData) {
        throw new Error("Módulo não encontrado. Atualização cancelada.")
      }

      if (moduleData.creatorId !== teacherId || !moduleData.ownerId?.includes(teacherId)) {
        throw new Error("Você não tem permissão para atualizar este módulo.")
      }

      if (moduleData.publishStatus !== PublishStatusEnum.PRIVATE) {
        throw new Error("Apenas módulos com status de publicação privado podem ser atualizados.")
      }

      const updatedModule = { ...moduleData, ...updates, updatedAt: new Date() }
      state.updateData("modules", moduleId, updatedModule)

      n.addNotification("success", `Módulo ${moduleData.name} atualizado com sucesso.`)
      return { success: true, message: "Módulo atualizado com sucesso.", module: updatedModule }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar o módulo")
      return { success: false, message: "Falha ao atualizar o módulo" }
    }
  }

  /**
   * ✅ Deletes a module (CRUD).
   * @param moduleId - The module ID.
   * @returns Success or failure message.
   */
  async deleteModule(moduleId: string): Promise<{ success: boolean; message: string }> {
    try {
      const state = useCentralStore.getState()
      const modules = state.getData("modules") || []
      const teacherId = this.getTeacherId()

      const moduleData = modules.find((m) => m.id === moduleId)
      if (!moduleData) {
        throw new Error("Módulo não encontrado. Exclusão cancelada.")
      }

      if (moduleData.creatorId !== teacherId) {
        throw new Error("Você não tem permissão para excluir este módulo.")
      }

      if (moduleData.publishStatus !== PublishStatusEnum.PRIVATE) {
        throw new Error("Apenas módulos com status de publicação privado podem ser excluídos.")
      }

      state.deleteData("modules", moduleId)

      n.addNotification("success", `Módulo ${moduleData.name} excluído com sucesso.`)
      return { success: true, message: "Módulo excluído com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao excluir o módulo")
      return { success: false, message: "Falha ao excluir o módulo" }
    }
  }

  /**
   * ✅ Retrieves a module by slug.
   * @param slug - The module slug.
   * @returns Module object or null.
   */
  getModuleBySlug(slug: string): Module | null {
    try {
      const state = useCentralStore.getState()
      const modules = state.getData("modules") || []
      return modules.find((m) => m.slug === slug) || null
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar o módulo")
      return null
    }
  }

  /**
   * ✅ Retrieves all available categories.
   * @returns List of categories.
   */
  getCategories(): string[] {
    try {
      const state = useCentralStore.getState()
      const modules = state.getData("modules") || []
      return Array.from(new Set(modules.map((module) => module.category).filter(Boolean)))
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar as categorias")
      return []
    }
  }

  /**
   * ✅ Retrieves all modules owned or created by the teacher.
   * @returns List of modules.
   */
  getModulesByTeacher(): Module[] {
    try {
      const teacherId = this.getTeacherId()
      const state = useCentralStore.getState()
      const modules = state.getData("modules") || []

      return modules.filter((module) => module.creatorId === teacherId || module.ownerId?.includes(teacherId))
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os módulos do professor")
      return []
    }
  }
}

export const moduleService = ModuleService.getInstance()
