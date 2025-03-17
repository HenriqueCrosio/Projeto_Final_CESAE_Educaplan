import { handleServiceErrorWithToast } from "@/lib/utils";
import { courseService } from "@/services/data-services/course.service";
import { courseModuleService } from "@/services/data-services/course-module.service";
import { PublishStatusEnum, type Course, type Module } from "@/types/interfaces";
import { useCentralStore } from "@/store/central.store";

class CourseWrapperService {
  private static instance: CourseWrapperService | null = null;
  private teacherId = "cm6bntysq0005s911c7r7o87g";

  private constructor() {}

  static getInstance(): CourseWrapperService {
    if (!CourseWrapperService.instance) {
      CourseWrapperService.instance = new CourseWrapperService();
    }
    return CourseWrapperService.instance;
  }

  private getTeacherId(): string {
    return this.teacherId;
  }

  /**
   * Creates a course, optionally with modules.
   * @param courseData - Course details.
   * @param moduleIds - (Optional) List of module IDs.
   * @returns Success or failure message.
   */
  async createCourseWithModules(
    courseData: Omit<Course, "id" | "slug" | "creatorId" | "createdAt" | "updatedAt" | "status" | "publishStatus">,
    moduleIds?: string[]
  ): Promise<{ success: boolean; message: string; course?: Course }> {
    try {
      // Step 1: Create the course without modules.
      const result = await courseService.addCourse(courseData);

      if (!result.success || !result.course) {
        throw new Error("Falha ao criar o curso.");
      }

      const newCourse = result.course;

      // Step 2: If modules are provided, link them to the course.
      if (moduleIds && moduleIds.length > 0) {
        const moduleAddResults = await Promise.all(
          moduleIds.map((moduleId) => courseModuleService.addModuleToCourse(newCourse.id, moduleId))
        );

        // Check if all modules were added successfully.
        if (moduleAddResults.some((res) => !res.success)) {
          throw new Error("Alguns módulos falharam ao serem adicionados ao curso.");
        }
      }

      return { success: true, message: "Curso criado com sucesso.", course: newCourse };
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao criar curso com módulos");
      return { success: false, message: "Erro ao criar curso com módulos" };
    }
  }

  /**
   * Updates a course and its associated modules.
   * @param courseId - Course ID.
   * @param courseUpdates - Course updates.
   * @param moduleIds - (Optional) Updated list of module IDs.
   * @returns Success or failure message.
   */
  async updateCourseWithModules(
    courseId: string,
    courseUpdates: Partial<Course>,
    moduleIds?: string[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Step 1: Update the course itself.
      const updateResult = await courseService.updateCourse(courseId, courseUpdates);
      if (!updateResult.success) {
        throw new Error("Falha ao atualizar o curso.");
      }

      // Step 2: Update the associated modules.
      if (moduleIds) {
        const moduleUpdateResult = await courseModuleService.updateModulesForCourse(courseId, moduleIds);
        if (!moduleUpdateResult.success) {
          throw new Error("Falha ao atualizar os módulos do curso.");
        }
      }

      return { success: true, message: "Curso e módulos atualizados com sucesso." };
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao atualizar curso com módulos");
      return { success: false, message: "Erro ao atualizar curso com módulos" };
    }
  }

  getCourseWithModules(courseId: string): (Course & { modules: Module[] }) | null {
    try {
      // Use the non-hook API to retrieve courses.
      const state = useCentralStore.getState();
      const courses: Course[] = state.getData("courses") || [];
      const course = courses.find((c) => c.id === courseId);
      if (!course) {
        throw new Error("Curso não encontrado.");
      }
      // Retrieve modules using your existing function (which already uses getState())
      const modules = courseModuleService.getModulesForCourse(courseId);
      return { ...course, modules };
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao recuperar curso com módulos");
      return null;
    }
  }

  /**
   * Deletes a course and removes all associated module relationships.
   * @param courseId - Course ID.
   * @returns Success or failure message.
   */
  async deleteCourseWithModules(courseId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Step 1: Remove all module associations.
      const modules = courseModuleService.getModulesForCourse(courseId);
      for (const m of modules) {
        await courseModuleService.removeModuleFromCourse(courseId, m.id);
      }

      // Step 2: Delete the course.
      const deleteResult = await courseService.deleteCourse(courseId);
      if (!deleteResult.success) {
        throw new Error("Falha ao excluir o curso.");
      }

      return { success: true, message: "Curso e módulos excluídos com sucesso." };
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao excluir curso com módulos");
      return { success: false, message: "Erro ao excluir curso com módulos" };
    }
  }

  // --------------------------
  // New functions added below:
  // --------------------------

  /**
   * Retrieves all courses associated with the teacher.
   * @returns List of courses.
   */
  getTeacherCourses(): Course[] {
    try {
      // This simply wraps the underlying courseService function.
      return courseService.getCoursesByTeacher();
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os cursos do professor");
      return [];
    }
  }

  /**
   * Retrieves the courses the teacher can edit.
   * Editable courses are defined as those with a PRIVATE publish status and
   * where the teacher is both the creator and one of the owners.
   * @returns List of editable courses.
   */
  getEditableCourses(): Course[] {
    try {
      const teacherId = this.getTeacherId();
      const courses = courseService.getCoursesByTeacher();
      return courses.filter(
        (course) =>
          course.publishStatus === PublishStatusEnum.PRIVATE &&
          course.creatorId === teacherId &&
          course.ownerId.includes(teacherId)
      );
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os cursos editáveis");
      return [];
    }
  }
}

export const courseWrapperService = CourseWrapperService.getInstance();
