import { handleServiceErrorWithToast } from "@/lib/utils"
import { moduleService } from "@/services/data-services/module.service"
import type { CreateModuleInput } from "@/actions/module.actions"
import type { Module } from "@prisma/client"

type UpdateModuleInput = {
  name?: string
  description?: string | null
  category?: string
  totalHours?: number
  averageHoursPerLesson?: number
}

/**
 * Wrapper de Module. A associação de tópicos e a geração automática de aulas
 * ficam ADIADAS até Topic/Lesson serem migrados para o Postgres.
 */
class ModuleWrapperService {
  private static instance: ModuleWrapperService | null = null

  private constructor() {}

  static getInstance(): ModuleWrapperService {
    if (!ModuleWrapperService.instance) {
      ModuleWrapperService.instance = new ModuleWrapperService()
    }
    return ModuleWrapperService.instance
  }

  async createModuleWithTopicsAndLessons(
    moduleData: CreateModuleInput,
    _topicIds?: string[]
  ): Promise<{ success: boolean; message: string; module?: Module }> {
    try {
      const result = await moduleService.addModule(moduleData)
      if (!result.success || !result.module) {
        throw new Error("Falha ao criar o módulo.")
      }
      // Tópicos/aulas serão associados quando Topic/Lesson forem migrados.
      return { success: true, message: "Módulo criado com sucesso.", module: result.module }
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao criar módulo")
      return { success: false, message: "Erro ao criar módulo" }
    }
  }

  async updateModuleWithTopicsAndLessons(
    moduleId: string,
    moduleUpdates: UpdateModuleInput,
    _topicIds?: string[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      const updateResult = await moduleService.updateModule(moduleId, moduleUpdates)
      if (!updateResult.success) {
        throw new Error("Falha ao atualizar o módulo.")
      }
      return { success: true, message: "Módulo atualizado com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao atualizar módulo")
      return { success: false, message: "Erro ao atualizar módulo" }
    }
  }

  async getModuleWithTopicsAndLessons(
    slug: string
  ): Promise<(Module & { topics: never[]; lessons: never[] }) | null> {
    try {
      const moduleData = await moduleService.getModuleBySlug(slug)
      if (!moduleData) {
        throw new Error("Módulo não encontrado.")
      }
      return { ...moduleData, topics: [], lessons: [] }
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao recuperar módulo")
      return null
    }
  }

  async deleteModuleWithTopicsAndLessons(
    moduleId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const deleteResult = await moduleService.deleteModule(moduleId)
      if (!deleteResult.success) {
        throw new Error("Falha ao excluir o módulo.")
      }
      return { success: true, message: "Módulo excluído com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao excluir módulo")
      return { success: false, message: "Erro ao excluir módulo" }
    }
  }
}

export const moduleWrapperService = ModuleWrapperService.getInstance()
