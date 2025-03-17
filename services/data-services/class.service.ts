import { generateId } from "@/lib/utils/general.utils";
import { useCentralStore } from "@/store/central.store";
import { NotificationService as n } from "@/services/data-services/notification.service";
import { handleServiceErrorWithToast } from "@/lib/utils";
import { type Class, type Team } from "@/types/interfaces";

class ClassService {
  private static instance: ClassService | null = null;
  // teacherId hardcoded (poderá ser substituído por um método de obtenção do teacher logado)
  private teacherId = "cm6bntysq0005s911c7r7o87g";

  private constructor() {}

  public static getInstance(): ClassService {
    if (!ClassService.instance) {
      ClassService.instance = new ClassService();
    }
    return ClassService.instance;
  }

  // -------------------------------
  // Operações para a entidade Class
  // -------------------------------

  /**
   * Adiciona uma nova classe.
   * @param classData Dados da classe (exceto id, createdAt, updatedAt e teams).
   * @returns A classe criada ou null em caso de erro.
   */
  public addClass(
    classData: Omit<Class, "id" | "createdAt" | "updatedAt" | "teams">
  ): Class | null {
    try {
      const state = useCentralStore.getState();
      const newClass: Class = {
        ...classData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        teams: [], // Inicialmente, a classe não possui times.
      };
      state.addData("classes", newClass);
      n.addNotification("success", `Classe "${newClass.name}" adicionada com sucesso.`);
      return newClass;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar a classe");
      return null;
    }
  }

  /**
   * Atualiza uma classe existente.
   * @param classId ID da classe a atualizar.
   * @param updates Atualizações parciais para a classe.
   * @returns A classe atualizada ou null em caso de erro.
   */
  public updateClass(
    classId: string,
    updates: Partial<Class>
  ): Class | null {
    try {
      const state = useCentralStore.getState();
      const classes: Class[] = state.getData("classes") || [];
      const classItem = classes.find((c) => c.id === classId);
      if (!classItem) {
        throw new Error("Classe não encontrada.");
      }
      const updatedClass = { ...classItem, ...updates, updatedAt: new Date() };
      state.updateData("classes", classId, updatedClass);
      n.addNotification("success", "Classe atualizada com sucesso.");
      return updatedClass;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar a classe");
      return null;
    }
  }

  /**
   * Remove uma classe.
   * @param classId ID da classe a remover.
   * @returns true se a remoção for bem-sucedida; false caso contrário.
   */
  public deleteClass(classId: string): boolean {
    try {
      const state = useCentralStore.getState();
      const classes: Class[] = state.getData("classes") || [];
      const classItem = classes.find((c) => c.id === classId);
      if (!classItem) {
        throw new Error("Classe não encontrada.");
      }
      state.deleteData("classes", classId);
      n.addNotification("success", "Classe removida com sucesso.");
      return true;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao remover a classe");
      return false;
    }
  }

  /**
   * Obtém uma classe pelo ID.
   * @param classId ID da classe.
   * @returns A classe encontrada ou null se não existir.
   */
  public getClassById(classId: string): Class | null {
    try {
      const state = useCentralStore.getState();
      const classes: Class[] = state.getData("classes") || [];
      return classes.find((c) => c.id === classId) || null;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar a classe");
      return null;
    }
  }

  /**
   * Obtém todas as classes associadas ao teacherId fornecido (ou o teacherId padrão).
   * @param teacherId (Opcional) ID do professor.
   * @returns Lista de classes.
   */
  public getClassesByTeacher(teacherId?: string): Class[] {
    try {
      const state = useCentralStore.getState();
      const classes: Class[] = state.getData("classes") || [];
      const idToUse = teacherId || this.teacherId;
      return classes.filter((c) => c.teacherId === idToUse);
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar as classes do professor");
      return [];
    }
  }

  /**
   * Obtém todas as classes associadas a um curso específico.
   * @param courseId ID do curso.
   * @returns Lista de classes do curso.
   */
  public getClassesByCourse(courseId: string): Class[] {
    try {
      const state = useCentralStore.getState();
      const classes: Class[] = state.getData("classes") || [];
      return classes.filter((c) => c.courseId === courseId);
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar as classes do curso");
      return [];
    }
  }

  async updateClassName(classId: string, newName: string) {
    try {
      const state = useCentralStore.getState();
      const classes = state.getData("classes") || [];
      
      const classData = classes.find((cls) => cls.id === classId);
      if (!classData) throw new Error("Turma não encontrada.");
  
      const updatedClass = { ...classData, name: newName, updatedAt: new Date() };
      state.updateData("classes", classId, updatedClass);
      return updatedClass;
    } catch (error) {
      console.error("Erro ao atualizar nome da turma:", error);
      return null;
    }
  }

  // -------------------------------
  // Operações para a entidade Team
  // -------------------------------

  /**
   * Adiciona um novo time.
   * @param teamData Dados do time (exceto id, createdAt, updatedAt, studentIds e exercises).
   * @returns O time criado ou null em caso de erro.
   */
  public addTeam(
    teamData: Omit<Team, "id" | "createdAt" | "updatedAt" | "studentIds">
  ): Team | null {
    try {
      const state = useCentralStore.getState();
      const newTeam: Team = {
        ...teamData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        studentIds: [],    // Inicialmente, nenhum estudante atribuído.
      };
      state.addData("teams", newTeam);
      n.addNotification("success", `Time "${newTeam.name}" adicionado com sucesso.`);
      return newTeam;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar o time");
      return null;
    }
  }

  /**
   * Atualiza um time existente.
   * @param teamId ID do time a atualizar.
   * @param updates Atualizações parciais para o time.
   * @returns O time atualizado ou null em caso de erro.
   */
  public updateTeam(
    teamId: string,
    updates: Partial<Team>
  ): Team | null {
    try {
      const state = useCentralStore.getState();
      const teams: Team[] = state.getData("teams") || [];
      const teamItem = teams.find((t) => t.id === teamId);
      if (!teamItem) {
        throw new Error("Time não encontrado.");
      }
      const updatedTeam = { ...teamItem, ...updates, updatedAt: new Date() };
      state.updateData("teams", teamId, updatedTeam);
      n.addNotification("success", "Time atualizado com sucesso.");
      return updatedTeam;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar o time");
      return null;
    }
  }

  /**
   * Remove um time.
   * @param teamId ID do time a remover.
   * @returns true se a remoção for bem-sucedida; false caso contrário.
   */
  public deleteTeam(teamId: string): boolean {
    try {
      const state = useCentralStore.getState();
      const teams: Team[] = state.getData("teams") || [];
      const teamItem = teams.find((t) => t.id === teamId);
      if (!teamItem) {
        throw new Error("Time não encontrado.");
      }
      state.deleteData("teams", teamId);
      n.addNotification("success", "Time removido com sucesso.");
      return true;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao remover o time");
      return false;
    }
  }

  /**
   * Obtém um time pelo ID.
   * @param teamId ID do time.
   * @returns O time encontrado ou null se não existir.
   */
  public getTeamById(teamId: string): Team | null {
    try {
      const state = useCentralStore.getState();
      const teams: Team[] = state.getData("teams") || [];
      return teams.find((t) => t.id === teamId) || null;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar o time");
      return null;
    }
  }

  /**
   * Obtém todos os times associados ao teacherId fornecido (ou o teacherId padrão).
   * @param teacherId (Opcional) ID do professor.
   * @returns Lista de times.
   */
  public getTeamsByTeacher(teacherId?: string): Team[] {
    try {
      const state = useCentralStore.getState();
      const teams: Team[] = state.getData("teams") || [];
      const idToUse = teacherId || this.teacherId;
      return teams.filter((t) => t.teacherId === idToUse);
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os times do professor");
      return [];
    }
  }
}

export const classService = ClassService.getInstance();
