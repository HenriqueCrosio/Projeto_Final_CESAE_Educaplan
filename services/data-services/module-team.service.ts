import { generateId } from "@/lib/utils/general.utils";
import { useCentralStore } from "@/store/central.store";
import { NotificationService as n } from "@/services/data-services/notification.service";
import { handleServiceErrorWithToast } from "@/lib/utils";
import { type ModuleTeam } from "@/types/interfaces";

class ModuleTeamService {
  private static instance: ModuleTeamService | null = null;
  // teacherId hardcoded (poderá ser substituído por um método de obtenção do teacher logado)
  private teacherId = "cm6bntysq0005s911c7r7o87g";

  private constructor() {}

  public static getInstance(): ModuleTeamService {
    if (!ModuleTeamService.instance) {
      ModuleTeamService.instance = new ModuleTeamService();
    }
    return ModuleTeamService.instance;
  }

  /**
   * Adiciona um novo ModuleTeam.
   * @param moduleTeamData Dados do ModuleTeam (exceto id, createdAt e updatedAt).
   * @returns O ModuleTeam criado ou null em caso de erro.
   */
  public addModuleTeam(
    moduleTeamData: Omit<ModuleTeam, "id" | "createdAt" | "updatedAt">
  ): ModuleTeam | null {
    try {
      const state = useCentralStore.getState();
      const newModuleTeam: ModuleTeam = {
        ...moduleTeamData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        // Garante que exerciseIds esteja definido (pode ser um array vazio se não fornecido)
        exerciseIds: moduleTeamData.exerciseIds || [],
      };
      state.addData("moduleTeams", newModuleTeam);
      n.addNotification("success", `ModuleTeam adicionado com sucesso.`);
      return newModuleTeam;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar o ModuleTeam");
      return null;
    }
  }

  /**
   * Atualiza um ModuleTeam existente.
   * @param moduleTeamId ID do ModuleTeam a atualizar.
   * @param updates Atualizações parciais para o ModuleTeam.
   * @returns O ModuleTeam atualizado ou null em caso de erro.
   */
  public updateModuleTeam(
    moduleTeamId: string,
    updates: Partial<ModuleTeam>
  ): ModuleTeam | null {
    try {
      const state = useCentralStore.getState();
      const moduleTeams: ModuleTeam[] = state.getData("moduleTeams") || [];
      const moduleTeam = moduleTeams.find((mt) => mt.id === moduleTeamId);
      if (!moduleTeam) {
        throw new Error("ModuleTeam não encontrado.");
      }
      const updatedModuleTeam: ModuleTeam = {
        ...moduleTeam,
        ...updates,
        updatedAt: new Date(),
      };
      state.updateData("moduleTeams", moduleTeamId, updatedModuleTeam);
      n.addNotification("success", "ModuleTeam atualizado com sucesso.");
      return updatedModuleTeam;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar o ModuleTeam");
      return null;
    }
  }

  /**
   * Remove um ModuleTeam.
   * @param moduleTeamId ID do ModuleTeam a remover.
   * @returns true se a remoção for bem-sucedida; false caso contrário.
   */
  public deleteModuleTeam(moduleTeamId: string): boolean {
    try {
      const state = useCentralStore.getState();
      const moduleTeams: ModuleTeam[] = state.getData("moduleTeams") || [];
      const moduleTeam = moduleTeams.find((mt) => mt.id === moduleTeamId);
      if (!moduleTeam) {
        throw new Error("ModuleTeam não encontrado.");
      }
      state.deleteData("moduleTeams", moduleTeamId);
      n.addNotification("success", "ModuleTeam removido com sucesso.");
      return true;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao remover o ModuleTeam");
      return false;
    }
  }

  /**
   * Obtém um ModuleTeam pelo ID.
   * @param moduleTeamId ID do ModuleTeam.
   * @returns O ModuleTeam encontrado ou null se não existir.
   */
  public getModuleTeamById(moduleTeamId: string): ModuleTeam | null {
    try {
      const state = useCentralStore.getState();
      const moduleTeams: ModuleTeam[] = state.getData("moduleTeams") || [];
      return moduleTeams.find((mt) => mt.id === moduleTeamId) || null;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar o ModuleTeam");
      return null;
    }
  }

  /**
   * Obtém todos os ModuleTeams associados ao teacherId fornecido (ou o teacherId padrão).
   * @param teacherId (Opcional) ID do professor.
   * @returns Lista de ModuleTeams.
   */
  public getModuleTeamsByTeacher(teacherId?: string): ModuleTeam[] {
    try {
      const state = useCentralStore.getState();
      const moduleTeams: ModuleTeam[] = state.getData("moduleTeams") || [];
      const idToUse = teacherId || this.teacherId;
      return moduleTeams.filter((mt) => mt.teacherId === idToUse);
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os ModuleTeams do professor");
      return [];
    }
  }

  /**
   * Obtém todos os ModuleTeams associados a um módulo específico.
   * @param moduleId ID do módulo.
   * @returns Lista de ModuleTeams.
   */
  public getModuleTeamsByModule(moduleId: string): ModuleTeam[] {
    try {
      const state = useCentralStore.getState();
      const moduleTeams: ModuleTeam[] = state.getData("moduleTeams") || [];
      return moduleTeams.filter((mt) => mt.moduleId === moduleId);
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os ModuleTeams do módulo");
      return [];
    }
  }

  /**
   * Obtém todos os ModuleTeams associados a uma classe específica.
   * @param classId ID da classe.
   * @returns Lista de ModuleTeams.
   */
  public getModuleTeamsByClass(classId: string): ModuleTeam[] {
    try {
      const state = useCentralStore.getState();
      const moduleTeams: ModuleTeam[] = state.getData("moduleTeams") || [];
      return moduleTeams.filter((mt) => mt.classId === classId);
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os ModuleTeams da classe");
      return [];
    }
  }
}

export const moduleTeamService = ModuleTeamService.getInstance();
