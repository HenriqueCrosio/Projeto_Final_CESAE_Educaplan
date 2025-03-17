import { generateId } from "@/lib/utils/general.utils"
import { useCentralStore } from "@/store/central.store"
import { NotificationService as n } from "@/services/data-services/notification.service"
import { handleServiceErrorWithToast } from "@/lib/utils"
import type { Enrollment } from "@/types/interfaces"
import { generateSlug } from "@/lib/utils"

class EnrollmentService {
  private static instance: EnrollmentService | null = null
  // teacherId hardcoded para testes (poderá ser substituído por um método dinâmico)
  private teacherId = "cm6bntysq0005s911c7r7o87g"

  private constructor() {}

  public static getInstance(): EnrollmentService {
    if (!EnrollmentService.instance) {
      EnrollmentService.instance = new EnrollmentService()
    }
    return EnrollmentService.instance
  }

  public getTeacherId(): string {
    return this.teacherId
  }

  /**
   * Adiciona um novo Enrollment.
   * @param enrollmentData Dados do Enrollment (exceto id, createdAt e updatedAt).
   * @returns O Enrollment criado ou null em caso de erro.
   */
  public addEnrollment(enrollmentData: Omit<Enrollment, "id" | "createdAt" | "updatedAt" | "slug">): Enrollment | null {
    try {
      const state = useCentralStore.getState()
      const slug = generateSlug(enrollmentData.name, "enrollment")
      const newEnrollment: Enrollment = {
        ...enrollmentData,
        id: generateId(),
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
        teacherId: this.teacherId,
        createdBy: this.teacherId,
      }
      state.addData("enrollments", newEnrollment)
      n.addNotification("success", "Enrollment adicionado com sucesso.")
      return newEnrollment
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar o Enrollment")
      return null
    }
  }

  /**
   * Atualiza um Enrollment existente.
   * @param enrollmentId ID do Enrollment a atualizar.
   * @param updates Atualizações parciais para o Enrollment.
   * @returns O Enrollment atualizado ou null em caso de erro.
   */
  public updateEnrollment(enrollmentId: string, updates: Partial<Enrollment>): Enrollment | null {
    try {
      const state = useCentralStore.getState()
      const enrollments: Enrollment[] = state.getData("enrollments") || []
      const enrollment = enrollments.find((e) => e.id === enrollmentId)
      if (!enrollment) {
        throw new Error("Enrollment não encontrado.")
      }
      const updatedEnrollment: Enrollment = {
        ...enrollment,
        ...updates,
        updatedAt: new Date(),
      }
      if (updates.name) {
        updatedEnrollment.slug = generateSlug(updates.name, "enrollment")
      }
      state.updateData("enrollments", enrollmentId, updatedEnrollment)
      n.addNotification("success", "Enrollment atualizado com sucesso.")
      return updatedEnrollment
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar o Enrollment")
      return null
    }
  }

  /**
   * Remove um Enrollment.
   * @param enrollmentId ID do Enrollment a remover.
   * @returns true se a remoção for bem-sucedida; false caso contrário.
   */
  public deleteEnrollment(enrollmentId: string): boolean {
    try {
      const state = useCentralStore.getState()
      const enrollments: Enrollment[] = state.getData("enrollments") || []
      const enrollment = enrollments.find((e) => e.id === enrollmentId)
      if (!enrollment) {
        throw new Error("Enrollment não encontrado.")
      }
      state.deleteData("enrollments", enrollmentId)
      n.addNotification("success", "Enrollment removido com sucesso.")
      return true
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao remover o Enrollment")
      return false
    }
  }

  /**
   * Obtém um Enrollment pelo ID.
   * @param enrollmentId ID do Enrollment.
   * @returns O Enrollment encontrado ou null se não existir.
   */
  public getEnrollmentById(enrollmentId: string): Enrollment | null {
    try {
      const state = useCentralStore.getState()
      const enrollments: Enrollment[] = state.getData("enrollments") || []
      return enrollments.find((e) => e.id === enrollmentId) || null
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar o Enrollment")
      return null
    }
  }

  /**
   * Obtém todos os Enrollments associados ao teacherId fornecido (ou o teacherId padrão).
   * @returns Lista de Enrollments.
   */
  public getEnrollmentsByTeacher(): Enrollment[] {
    try {
      const state = useCentralStore.getState()
      const enrollments: Enrollment[] = state.getData("enrollments") || []
      const idToUse = this.teacherId
      return enrollments.filter((e) => e.teacherId === idToUse)
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os Enrollments do professor")
      return []
    }
  }


    /**
   * Obtém um Enrollment pelo slug.
   * @param slug Slug do Enrollment.
   * @returns O Enrollment encontrado ou null se não existir.
   */
  public getEnrollmentBySlug(slug: string): Enrollment | null {
    try {
      const state = useCentralStore.getState()
      const enrollments: Enrollment[] = state.getData("enrollments") || []
      return enrollments.find((e) => e.slug === slug) || null
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar o Enrollment pelo slug")
      return null
    }
  }
}

export const enrollmentService = EnrollmentService.getInstance()

