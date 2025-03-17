import { generateId } from "@/lib/utils/general.utils";
import { useCentralStore } from "@/store/central.store";
import { NotificationService as n } from "@/services/data-services/notification.service";
import { handleServiceErrorWithToast } from "@/lib/utils";
import { type ClassStudent } from "@/types/interfaces";

class ClassStudentService {
  private static instance: ClassStudentService | null = null;

  private constructor() {}

  public static getInstance(): ClassStudentService {
    if (!ClassStudentService.instance) {
      ClassStudentService.instance = new ClassStudentService();
    }
    return ClassStudentService.instance;
  }

  /**
   * Creates a new ClassStudent record.
   * @param data - Data for the ClassStudent (except id).
   * @returns The created ClassStudent object or null in case of an error.
   */
  public addClassStudent(
    data: Omit<ClassStudent, "id">
  ): ClassStudent | null {
    try {
      const state = useCentralStore.getState();
      const newClassStudent: ClassStudent = {
        ...data,
        id: generateId(),
      };
      state.addData("classStudents", newClassStudent);
      n.addNotification("success", "Student added successfully.");
      return newClassStudent;
    } catch (error) {
      handleServiceErrorWithToast(error, "Failed to add Student");
      return null;
    }
  }

  /**
   * Updates an existing ClassStudent record.
   * @param id - The ID of the ClassStudent to update.
   * @param updates - Partial updates for the ClassStudent.
   * @returns The updated ClassStudent object or null in case of an error.
   */
  public updateClassStudent(
    id: string,
    updates: Partial<ClassStudent>
  ): ClassStudent | null {
    try {
      const state = useCentralStore.getState();
      const classStudents: ClassStudent[] = state.getData("classStudents") || [];
      const existing = classStudents.find((cs) => cs.id === id);
      if (!existing) {
        throw new Error("ClassStudent not found.");
      }
      const updated = { ...existing, ...updates };
      state.updateData("classStudents", id, updated);
      n.addNotification("success", "Student updated successfully.");
      return updated;
    } catch (error) {
      handleServiceErrorWithToast(error, "Failed to update Student");
      return null;
    }
  }

  /**
   * Deletes a ClassStudent record.
   * @param id - The ID of the ClassStudent to delete.
   * @returns True if deletion was successful; otherwise, false.
   */
  public deleteClassStudent(id: string): boolean {
    try {
      const state = useCentralStore.getState();
      const classStudents: ClassStudent[] = state.getData("classStudents") || [];
      const existing = classStudents.find((cs) => cs.id === id);
      if (!existing) {
        throw new Error("ClassStudent not found.");
      }
      state.deleteData("classStudents", id);
      n.addNotification("success", "Student deleted successfully.");
      return true;
    } catch (error) {
      handleServiceErrorWithToast(error, "Failed to delete Student");
      return false;
    }
  }

  /**
   * Retrieves a ClassStudent record by its ID.
   * @param id - The ID of the ClassStudent.
   * @returns The ClassStudent object or null if not found.
   */
  public getClassStudentById(id: string): ClassStudent | null {
    try {
      const state = useCentralStore.getState();
      const classStudents: ClassStudent[] = state.getData("classStudents") || [];
      return classStudents.find((cs) => cs.id === id) || null;
    } catch (error) {
      handleServiceErrorWithToast(error, "Failed to retrieve Student");
      return null;
    }
  }

  /**
   * Retrieves all ClassStudent records for a given class.
   * @param classId - The ID of the class.
   * @returns An array of ClassStudent records.
   */
  public getClassStudentsByClass(classId: string): ClassStudent[] {
    try {
      const state = useCentralStore.getState();
      const classStudents: ClassStudent[] = state.getData("classStudents") || [];
      return classStudents.filter((cs) => cs.classId === classId);
    } catch (error) {
      handleServiceErrorWithToast(error, "Failed to retrieve Students by class");
      return [];
    }
  }

  /**
   * Retrieves all ClassStudent records for a given student.
   * @param studentId - The ID of the student.
   * @returns An array of ClassStudent records.
   */
  public getClassStudentsByStudent(studentId: string): ClassStudent[] {
    try {
      const state = useCentralStore.getState();
      const classStudents: ClassStudent[] = state.getData("classStudents") || [];
      return classStudents.filter((cs) => cs.studentId === studentId);
    } catch (error) {
      handleServiceErrorWithToast(error, "Failed to retrieve Students by student");
      return [];
    }
  }
    
  /**
   * Adds multiple students to a class.
   * @param classId - The ID of the class.
   * @param studentIds - An array of student IDs to add.
   * @returns True if all students were added successfully; otherwise, false.
   */
  public addStudentsToClass(classId: string, studentIds: string[]): boolean {
    try {
      let allSuccess = true;
      studentIds.forEach((studentId) => {
        const result = classStudentService.addClassStudent({ classId, studentId });
        if (!result) {
          allSuccess = false;
        }
      });
      if (allSuccess) {
        n.addNotification("success", "Todos os alunos foram adicionados à classe com sucesso.");
      } else {
        n.addNotification("info", "Alguns alunos não foram adicionados à classe.");
      }
      return allSuccess;
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar alunos à classe");
      return false;
    }
  }


  
}

export const classStudentService = ClassStudentService.getInstance();
