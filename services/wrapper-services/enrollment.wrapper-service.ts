import { handleServiceErrorWithToast } from "@/lib/utils";
import { enrollmentService } from "@/services/data-services/enrollment.service";
import { moduleAssignmentService } from "@/services/data-services/assignment.service";
import { classService } from "@/services/data-services/class.service";
import { type Enrollment, type ModuleAssignment, type Class } from "@/types/interfaces";

// Interface que define os detalhes completos de um Enrollment.
export interface EnrollmentDetails {
  enrollment: Enrollment;
  assignments: ModuleAssignment[];
  classes: Class[];
}

class EnrollmentWrapperService {
  private static instance: EnrollmentWrapperService | null = null;

  private constructor() {}

  public static getInstance(): EnrollmentWrapperService {
    if (!EnrollmentWrapperService.instance) {
      EnrollmentWrapperService.instance = new EnrollmentWrapperService();
    }
    return EnrollmentWrapperService.instance;
  }
    
  /**
   * Cria um Enrollment utilizando os dados fornecidos.
   * @param enrollmentData Dados do Enrollment (exceto id, createdAt, updatedAt e totalPrice).
   * @returns O Enrollment criado ou null em caso de erro.
   */
  public createEnrollment(
    enrollmentData: Omit<Enrollment, "id" | "createdAt" | "updatedAt" | "totalPrice" | "slug">
  ): Enrollment | null {
    try {
      const newEnrollment = enrollmentService.addEnrollment(enrollmentData);
      if (!newEnrollment) {
        throw new Error("Erro ao criar o enrollment.");
      }
      // Opcionalmente, você pode realizar cálculos para definir o totalPrice aqui.
      return newEnrollment;
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao criar enrollment");
      return null;
    }
  }

  /**
   * Atualiza um Enrollment existente.
   * @param enrollmentId ID do Enrollment a atualizar.
   * @param updates Atualizações parciais para o Enrollment.
   * @returns O Enrollment atualizado ou null em caso de erro.
   */
  public updateEnrollment(
    enrollmentId: string,
    updates: Partial<Enrollment>
  ): Enrollment | null {
    try {
      const updatedEnrollment = enrollmentService.updateEnrollment(enrollmentId, updates);
      if (!updatedEnrollment) {
        throw new Error("Enrollment não atualizado.");
      }
      return updatedEnrollment;
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao atualizar enrollment");
      return null;
    }
  }

  /**
   * Recupera os detalhes completos de um Enrollment.
   * Inclui o próprio Enrollment, seus ModuleAssignments (usando os assignmentIds)
   * e as Classes associadas (usando os classIds).
   *
   * @param enrollmentId ID do Enrollment.
   * @returns Objeto contendo os detalhes do enrollment ou null se não encontrado.
   */
  public getEnrollmentDetails(enrollmentId: string): EnrollmentDetails | null {
    try {
      const enrollment = enrollmentService.getEnrollmentById(enrollmentId);
      if (!enrollment) {
        throw new Error("Enrollment não encontrado.");
      }

      // Recupera os ModuleAssignments associados (caso existam)
      const assignments: ModuleAssignment[] = [];
      if (enrollment.assignmentIds && enrollment.assignmentIds.length > 0) {
        for (const assignmentId of enrollment.assignmentIds) {
          const assignment = moduleAssignmentService.getModuleAssignmentById(assignmentId);
          if (assignment) {
            assignments.push(assignment);
          }
        }
      }

      // Recupera as Classes associadas (caso existam)
      const classes: Class[] = [];
      if (enrollment.classIds && enrollment.classIds.length > 0) {
        for (const classId of enrollment.classIds) {
          const classItem = classService.getClassById(classId);
          if (classItem) {
            classes.push(classItem);
          }
        }
      }

      return {
        enrollment,
        assignments,
        classes,
      };
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao recuperar os detalhes do enrollment");
      return null;
    }
  }

  /**
   * Recupera todos os Enrollments associados ao teacherId fornecido (ou o teacherId padrão).
   * @param teacherId (Opcional) ID do professor.
   * @returns Lista de Enrollments.
   */
  public getEnrollments(): Enrollment[] {
    try {
        return enrollmentService.getEnrollmentsByTeacher();
    } catch (error) {
        handleServiceErrorWithToast(error, "Erro ao recuperar os enrollments");
        return [];
    }
  }
}

export const enrollmentWrapperService = EnrollmentWrapperService.getInstance();
