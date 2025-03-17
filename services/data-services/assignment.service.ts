import { generateId } from "@/lib/utils/general.utils";
import { useCentralStore } from "@/store/central.store";
import { NotificationService as n } from "@/services/data-services/notification.service";
import { handleServiceErrorWithToast } from "@/lib/utils";
import { type ModuleAssignment } from "@/types/interfaces";

class ModuleAssignmentService {
  private static instance: ModuleAssignmentService | null = null;
  // teacherId hardcoded para testes (poderá ser substituído por um método dinâmico)
  private teacherId = "cm6bntysq0005s911c7r7o87g";

  private constructor() {}

  public static getInstance(): ModuleAssignmentService {
    if (!ModuleAssignmentService.instance) {
      ModuleAssignmentService.instance = new ModuleAssignmentService();
    }
    return ModuleAssignmentService.instance;
  }

  /**
   * Adiciona um novo ModuleAssignment.
   * @param assignmentData Dados do ModuleAssignment (exceto id, createdAt e updatedAt).
   * @returns O ModuleAssignment criado ou null em caso de erro.
   */
  public addModuleAssignment(
    assignmentData: Omit<ModuleAssignment, "id" | "createdAt" | "updatedAt">
  ): ModuleAssignment | null {
    try {
      const state = useCentralStore.getState();
      const newAssignment: ModuleAssignment = {
        ...assignmentData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state.addData("moduleAssignments", newAssignment);
      n.addNotification("success", "ModuleAssignment adicionado com sucesso.");
      return newAssignment;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar o ModuleAssignment");
      return null;
    }
  }

  /**
   * Atualiza um ModuleAssignment existente.
   * @param assignmentId ID do ModuleAssignment a atualizar.
   * @param updates Atualizações parciais para o ModuleAssignment.
   * @returns O ModuleAssignment atualizado ou null em caso de erro.
   */
  public updateModuleAssignment(
    assignmentId: string,
    updates: Partial<ModuleAssignment>
  ): ModuleAssignment | null {
    try {
      const state = useCentralStore.getState();
      const assignments: ModuleAssignment[] = state.getData("moduleAssignments") || [];
      const assignment = assignments.find((a) => a.id === assignmentId);
      if (!assignment) {
        throw new Error("ModuleAssignment não encontrado.");
      }
      const updatedAssignment: ModuleAssignment = {
        ...assignment,
        ...updates,
        updatedAt: new Date(),
      };
      state.updateData("moduleAssignments", assignmentId, updatedAssignment);
      n.addNotification("success", "ModuleAssignment atualizado com sucesso.");
      return updatedAssignment;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar o ModuleAssignment");
      return null;
    }
  }

  /**
   * Remove um ModuleAssignment.
   * @param assignmentId ID do ModuleAssignment a remover.
   * @returns true se a remoção for bem-sucedida; false caso contrário.
   */
  public deleteModuleAssignment(assignmentId: string): boolean {
    try {
      const state = useCentralStore.getState();
      const assignments: ModuleAssignment[] = state.getData("moduleAssignments") || [];
      const assignment = assignments.find((a) => a.id === assignmentId);
      if (!assignment) {
        throw new Error("ModuleAssignment não encontrado.");
      }
      state.deleteData("moduleAssignments", assignmentId);
      n.addNotification("success", "ModuleAssignment removido com sucesso.");
      return true;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao remover o ModuleAssignment");
      return false;
    }
  }

  /**
   * Obtém um ModuleAssignment pelo ID.
   * @param assignmentId ID do ModuleAssignment.
   * @returns O ModuleAssignment encontrado ou null se não existir.
   */
  public getModuleAssignmentById(assignmentId: string): ModuleAssignment | null {
    try {
      const state = useCentralStore.getState();
      const assignments: ModuleAssignment[] = state.getData("moduleAssignments") || [];
      return assignments.find((a) => a.id === assignmentId) || null;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar o ModuleAssignment");
      return null;
    }
  }

  /**
   * Obtém todos os ModuleAssignments associados ao teacherId fornecido (ou o teacherId padrão).
   * @param teacherId (Opcional) ID do professor.
   * @returns Lista de ModuleAssignments.
   */
  public getModuleAssignmentsByTeacher(teacherId?: string): ModuleAssignment[] {
    try {
      const state = useCentralStore.getState();
      const assignments: ModuleAssignment[] = state.getData("moduleAssignments") || [];
      const idToUse = teacherId || this.teacherId;
      return assignments.filter((a) => a.teacherId === idToUse);
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os ModuleAssignments do professor");
      return [];
    }
  }

  /**
   * Obtém todos os ModuleAssignments associados a um módulo específico.
   * @param moduleId ID do módulo.
   * @returns Lista de ModuleAssignments.
   */
  public getModuleAssignmentsByModule(moduleId: string): ModuleAssignment[] {
    try {
      const state = useCentralStore.getState();
      const assignments: ModuleAssignment[] = state.getData("moduleAssignments") || [];
      return assignments.filter((a) => a.moduleId === moduleId);
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os ModuleAssignments do módulo");
      return [];
    }
  }
    
  /**
   * Obtém o preço por hora e a moeda de um ModuleAssignment específico.
   * @param assignmentId ID do ModuleAssignment.
   * @returns Um objeto contendo pricePerHour e currency, ou null se não for encontrado.
   */
  public getPriceAndCurrency(assignmentId: string): { pricePerHour: number; currency: "EUR" | "USD" } | null {
    try {
      const assignment = this.getModuleAssignmentById(assignmentId);
      if (!assignment) {
        throw new Error("ModuleAssignment não encontrado.");
      }
      const { pricePerHour, currency } = assignment;
      return { pricePerHour, currency };
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar o preço por hora e a moeda do ModuleAssignment");
      return null;
    }
  }
}

export const moduleAssignmentService = ModuleAssignmentService.getInstance();
