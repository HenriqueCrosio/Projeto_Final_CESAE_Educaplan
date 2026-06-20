import { handleServiceErrorWithToast } from "@/lib/utils";
import { courseService } from "@/services/data-services/course.service";
import { courseModuleService } from "@/services/data-services/course-module.service";
import { getCourseById } from "@/actions/course.actions";
import type { Course, Module } from "@prisma/client";

type CreateCourseInput = { name: string; description?: string | null; category: string };
type UpdateCourseInput = { name?: string; description?: string | null; category?: string };

/**
 * Opção A: módulos pertencem a um curso (Module.courseId) e são criados dentro do curso.
 * Por isso não há mais "anexar módulos" na criação/edição de curso.
 */
class CourseWrapperService {
  private static instance: CourseWrapperService | null = null;

  private constructor() {}

  static getInstance(): CourseWrapperService {
    if (!CourseWrapperService.instance) {
      CourseWrapperService.instance = new CourseWrapperService();
    }
    return CourseWrapperService.instance;
  }

  async createCourseWithModules(
    courseData: CreateCourseInput
  ): Promise<{ success: boolean; message: string; course?: Course }> {
    try {
      const result = await courseService.addCourse(courseData);
      if (!result.success || !result.course) {
        throw new Error("Falha ao criar o curso.");
      }
      return { success: true, message: "Curso criado com sucesso.", course: result.course };
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao criar curso");
      return { success: false, message: "Erro ao criar curso" };
    }
  }

  async updateCourseWithModules(
    courseId: string,
    courseUpdates: UpdateCourseInput
  ): Promise<{ success: boolean; message: string }> {
    try {
      const updateResult = await courseService.updateCourse(courseId, courseUpdates);
      if (!updateResult.success) {
        throw new Error("Falha ao atualizar o curso.");
      }
      return { success: true, message: "Curso atualizado com sucesso." };
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao atualizar curso");
      return { success: false, message: "Erro ao atualizar curso" };
    }
  }

  async getCourseWithModules(
    courseId: string
  ): Promise<(Course & { modules: Module[] }) | null> {
    try {
      const course = await getCourseById(courseId);
      if (!course) {
        throw new Error("Curso não encontrado.");
      }
      const modules = await courseModuleService.getModulesForCourse(courseId);
      return { ...course, modules };
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao recuperar curso com módulos");
      return null;
    }
  }

  async deleteCourseWithModules(courseId: string): Promise<{ success: boolean; message: string }> {
    try {
      const deleteResult = await courseService.deleteCourse(courseId);
      if (!deleteResult.success) {
        throw new Error("Falha ao excluir o curso.");
      }
      return { success: true, message: "Curso excluído com sucesso." };
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao excluir curso");
      return { success: false, message: "Erro ao excluir curso" };
    }
  }
}

export const courseWrapperService = CourseWrapperService.getInstance();
