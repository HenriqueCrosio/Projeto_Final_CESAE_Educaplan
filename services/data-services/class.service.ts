// Serviço de Turmas (Class) e Times (Team) consumindo o Postgres via Server Actions.
// Substitui o antigo store Zustand. Os tipos vêm do @prisma/client.
import {
  createClass,
  getMyClasses,
  getClassesByCourse,
  getClassById,
  updateClass,
  deleteClass,
  addStudentsToClass,
  removeStudentFromClass,
  type CreateClassInput,
} from "@/actions/class.actions";
import {
  createTeam,
  getTeamsByClass,
  updateTeam,
  deleteTeam,
  addStudentsToTeam,
  removeStudentFromTeam,
  type CreateTeamInput,
} from "@/actions/team.actions";
import { handleServiceErrorWithToast } from "@/lib/utils";
import { NotificationService as n } from "@/services/data-services/notification.service";

class ClassService {
  private static instance: ClassService | null = null;
  private constructor() {}

  public static getInstance(): ClassService {
    if (!ClassService.instance) ClassService.instance = new ClassService();
    return ClassService.instance;
  }

  // ----- Class -----
  public async addClass(data: CreateClassInput) {
    try {
      const created = await createClass(data);
      n.addNotification("success", `Turma "${created.name}" criada com sucesso.`);
      return created;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao criar a turma");
      return null;
    }
  }

  public async getClassesByTeacher() {
    try {
      return await getMyClasses();
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar as turmas");
      return [];
    }
  }

  public async getClassesByCourse(courseId: string) {
    try {
      return await getClassesByCourse(courseId);
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar as turmas do curso");
      return [];
    }
  }

  public async getClassById(classId: string) {
    try {
      return await getClassById(classId);
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar a turma");
      return null;
    }
  }

  public async updateClassName(classId: string, newName: string) {
    try {
      return await updateClass(classId, { name: newName });
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar o nome da turma");
      return null;
    }
  }

  public async deleteClass(classId: string) {
    try {
      const res = await deleteClass(classId);
      if (res.count) n.addNotification("success", "Turma removida com sucesso.");
      return res.count > 0;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao remover a turma");
      return false;
    }
  }

  public async addStudentsToClass(classId: string, studentIds: string[]) {
    try {
      const res = await addStudentsToClass(classId, studentIds);
      return res.count > 0;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar alunos à turma");
      return false;
    }
  }

  public async removeStudentFromClass(classId: string, studentId: string) {
    try {
      await removeStudentFromClass(classId, studentId);
      return true;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao remover o aluno da turma");
      return false;
    }
  }

  // ----- Team -----
  public async addTeam(data: CreateTeamInput) {
    try {
      const created = await createTeam(data);
      n.addNotification("success", `Time "${created.name}" criado com sucesso.`);
      return created;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao criar o time");
      return null;
    }
  }

  public async getTeamsByClass(classId: string) {
    try {
      return await getTeamsByClass(classId);
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os times da turma");
      return [];
    }
  }

  public async updateTeam(teamId: string, data: { name?: string; description?: string | null }) {
    try {
      return await updateTeam(teamId, data);
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar o time");
      return null;
    }
  }

  public async deleteTeam(teamId: string) {
    try {
      const res = await deleteTeam(teamId);
      if (res.count) n.addNotification("success", "Time removido com sucesso.");
      return res.count > 0;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao remover o time");
      return false;
    }
  }

  public async addStudentsToTeam(teamId: string, studentIds: string[]) {
    try {
      const res = await addStudentsToTeam(teamId, studentIds);
      return res.count > 0;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar alunos ao time");
      return false;
    }
  }

  public async removeStudentFromTeam(teamId: string, studentId: string) {
    try {
      await removeStudentFromTeam(teamId, studentId);
      return true;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao remover o aluno do time");
      return false;
    }
  }
}

export const classService = ClassService.getInstance();
