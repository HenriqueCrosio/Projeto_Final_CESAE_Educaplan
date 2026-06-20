import { NotificationService as n } from "@/services/data-services/notification.service"
import { handleServiceErrorWithToast } from "@/lib/utils"
import {
  createModule,
  getMyModules,
  getModuleBySlug as getModuleBySlugAction,
  getModuleCategories,
  updateModule as updateModuleAction,
  deleteModule as deleteModuleAction,
  type CreateModuleInput,
} from "@/actions/module.actions"
import type { Module } from "@prisma/client"

type UpdateModuleInput = {
  name?: string
  description?: string | null
  category?: string
  totalHours?: number
  averageHoursPerLesson?: number
}

/**
 * ModuleService: fonte da verdade = Postgres. Um módulo pertence a um curso (Opção A).
 * Identidade e organização vêm sempre da sessão.
 */
class ModuleService {
  private static instance: ModuleService | null = null

  private constructor() {}

  static getInstance(): ModuleService {
    if (!ModuleService.instance) {
      ModuleService.instance = new ModuleService()
    }
    return ModuleService.instance
  }

  async addModule(
    module: CreateModuleInput
  ): Promise<{ success: boolean; message: string; module?: Module }> {
    try {
      const created = await createModule(module)
      n.addNotification("success", `Módulo ${created.name} adicionado com sucesso.`)
      return { success: true, message: "Módulo adicionado com sucesso.", module: created }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar o módulo")
      return { success: false, message: "Falha ao adicionar o módulo" }
    }
  }

  async updateModule(
    moduleId: string,
    updates: UpdateModuleInput
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await updateModuleAction(moduleId, updates)
      if (result.count === 0) {
        throw new Error("Módulo não encontrado ou sem permissão para atualizar.")
      }
      n.addNotification("success", "Módulo atualizado com sucesso.")
      return { success: true, message: "Módulo atualizado com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar o módulo")
      return { success: false, message: "Falha ao atualizar o módulo" }
    }
  }

  async deleteModule(moduleId: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await deleteModuleAction(moduleId)
      if (result.count === 0) {
        throw new Error("Módulo não encontrado ou sem permissão para excluir.")
      }
      n.addNotification("success", "Módulo excluído com sucesso.")
      return { success: true, message: "Módulo excluído com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao excluir o módulo")
      return { success: false, message: "Falha ao excluir o módulo" }
    }
  }

  async getModuleBySlug(slug: string): Promise<Module | null> {
    try {
      return await getModuleBySlugAction(slug)
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar o módulo")
      return null
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      return await getModuleCategories()
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar as categorias")
      return []
    }
  }

  async getModulesByTeacher(): Promise<Module[]> {
    try {
      return await getMyModules()
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os módulos do professor")
      return []
    }
  }
}

export const moduleService = ModuleService.getInstance()
