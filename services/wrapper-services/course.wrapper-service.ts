import { handleServiceErrorWithToast } from "@/lib/utils";
import { courseService } from "@/services/data-services/course.service";
import { courseModuleService } from "@/services/data-services/course-module.service";
import { type Course, type Module } from "@/types/interfaces";
import { useCentralStore } from "@/store/central.store";
import type { Course as PrismaCourse } from "@prisma/client";

type CreateCourseInput = { name: string; description?: string | null; category: string };

class CourseWrapperService {
  private static instance: CourseWrapperService | null = null;

  private constructor() {}

  static getInstance(): CourseWrapperService {
    if (!CourseWrapperService.instance) {
      CourseWrapperService.instance = new CourseWrapperService();
    }
    return CourseWrapperService.instance;
  }

  /**
   * Cria um curso (no Postgres) e, opcionalmente, associa módulos.
   * A associação de módulos ainda usa o serviço legado e só ocorre quando há módulos.
   */
  async createCourseWithModules(
    courseData: CreateCourseInput,
    moduleIds?: string[]
  ): Promise<{ success: boolean; message: string; course?: PrismaCourse }> {
    try {
      const result = await courseService.addCourse(courseData);

      if (!result.success || !result.course) {
        throw new Error("Falha ao criar o curso.");
      }

      const newCourse = result.course;

      if (moduleIds && moduleIds.length > 0) {
        const moduleAddResults = await Promise.all(
          moduleIds.map((moduleId) => courseModuleService.addModuleToCourse(newCourse.id, moduleId))
        );

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
   * Atualiza um curso (no Postgres) e os seus módulos associados (legado).
   */
  async updateCourseWithModules(
    courseId: string,
    courseUpdates: { name?: string; description?: string | null; category?: string },
    moduleIds?: string[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      const updateResult = await courseService.updateCourse(courseId, courseUpdates);
      if (!updateResult.success) {
        throw new Error("Falha ao atualizar o curso.");
      }

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

  /**
   * Recupera um curso com os seus módulos.
   * NOTA: ainda lê do store legado para a parte de módulos (migração de Module pendente).
   */
  getCourseWithModules(courseId: string): (Course & { modules: Module[] }) | null {
    try {
      const state = useCentralStore.getState();
      const courses: Course[] = state.getData("courses") || [];
      const course = courses.find((c) => c.id === courseId);
      if (!course) {
        throw new Error("Curso não encontrado.");
      }
      const modules = courseModuleService.getModulesForCourse(courseId);
      return { ...course, modules };
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao recuperar curso com módulos");
      return null;
    }
  }

  /**
   * Exclui um curso (no Postgres) e remove as associações de módulos (legado).
   */
  async deleteCourseWithModules(courseId: string): Promise<{ success: boolean; message: string }> {
    try {
      const modules = courseModuleService.getModulesForCourse(courseId);
      for (const m of modules) {
        await courseModuleService.removeModuleFromCourse(courseId, m.id);
      }

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
}

export const courseWrapperService = CourseWrapperService.getInstance();
