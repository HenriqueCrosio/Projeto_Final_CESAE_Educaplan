import { generateId } from "@/lib/utils/general.utils"
import { useCentralStore } from "@/store/central.store"
import { NotificationService as n } from "@/services/data-services/notification.service"
import { handleServiceErrorWithToast } from "@/lib/utils"
import { courseService } from "./course.service"
import type { CourseModule, Course, Module } from "@/types/interfaces"

class CourseModuleService {
  private static instance: CourseModuleService | null = null
  private teacherId = "cm6bntysq0005s911c7r7o87g" // Hardcoded teacher ID for testing

  private constructor() {}

  static getInstance(): CourseModuleService {
    if (!CourseModuleService.instance) {
      CourseModuleService.instance = new CourseModuleService()
    }
    return CourseModuleService.instance
  }

  private getTeacherId(): string {
    return this.teacherId
  }

  useCourseModules = () => useCentralStore((state) => state.getData("courseModules") || [])

  /**
   * ✅ Adds a module to a course.
   * @param courseId - The course ID.
   * @param moduleId - The module ID.
   * @returns Success or failure message.
   */
  async addModuleToCourse(courseId: string, moduleId: string): Promise<{ success: boolean; message: string }> {
    try {
      const state = useCentralStore.getState()
      const courseModules = state.getData("courseModules") || []
      const teacherId = this.getTeacherId()

      // Check if the module is already in the course
      if (courseModules.some((cm) => cm.courseId === courseId && cm.moduleId === moduleId)) {
        throw new Error("Este módulo já está associado a este curso.")
      }

      const newCourseModule: CourseModule = {
        id: generateId(),
        courseId,
        moduleId,
        teacherId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      state.addData("courseModules", newCourseModule)

      n.addNotification("success", "Módulo adicionado ao curso com sucesso.")
      return { success: true, message: "Módulo adicionado ao curso com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao adicionar o módulo ao curso")
      return { success: false, message: "Erro ao adicionar o módulo ao curso" }
    }
  }

  /**
   * ✅ Removes a module from a course.
   * @param courseId - The course ID.
   * @param moduleId - The module ID.
   * @returns Success or failure message.
   */
  async removeModuleFromCourse(courseId: string, moduleId: string): Promise<{ success: boolean; message: string }> {
    try {
      const state = useCentralStore.getState()
      const courseModules = state.getData("courseModules") || []
      const teacherId = this.getTeacherId()

      const courseModule = courseModules.find(
        (cm) => cm.courseId === courseId && cm.moduleId === moduleId && cm.teacherId === teacherId
      )

      if (!courseModule) {
        throw new Error("Módulo não encontrado ou permissão negada.")
      }

      state.deleteData("courseModules", courseModule.id)

      n.addNotification("success", "Módulo removido do curso com sucesso.")
      return { success: true, message: "Módulo removido do curso com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao remover o módulo do curso")
      return { success: false, message: "Erro ao remover o módulo do curso" }
    }
  }

  /**
   * ✅ Updates the modules associated with a course.
   * Ensures that only the selected modules are linked to the course.
   * @param courseId - The course ID.
   * @param moduleIds - The new list of module IDs.
   * @returns Success or failure message.
   */
  async updateModulesForCourse(courseId: string, moduleIds: string[]): Promise<{ success: boolean; message: string }> {
    try {
      const currentModules = this.getModulesForCourse(courseId).map((m) => m.id)

      // Remove modules that are no longer selected
      for (const moduleId of currentModules) {
        if (!moduleIds.includes(moduleId)) {
          await this.removeModuleFromCourse(courseId, moduleId)
        }
      }

      // Add new modules
      for (const moduleId of moduleIds) {
        if (!currentModules.includes(moduleId)) {
          await this.addModuleToCourse(courseId, moduleId)
        }
      }

      return { success: true, message: "Módulos atualizados com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao atualizar os módulos do curso")
      return { success: false, message: "Erro ao atualizar os módulos do curso" }
    }
  }

  /**
   * ✅ Retrieves modules linked to a specific course.
   * @param courseId - The course ID.
   * @returns Array of modules.
   */
  getModulesForCourse(courseId: string): Module[] {
    try {
      const state = useCentralStore.getState()
      const courseModules = state.getData("courseModules") || []
      const modules = state.getData("modules") || []

      const moduleIds = courseModules.filter((cm) => cm.courseId === courseId).map((cm) => cm.moduleId)

      return modules.filter((module) => moduleIds.includes(module.id))
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao recuperar os módulos do curso")
      return []
    }
  }

  /**
   * ✅ Retrieves all courses that contain a specific module.
   * @param moduleId - The module ID.
   * @returns Array of courses.
   */
  getCoursesForModule(moduleId: string): Course[] {
    try {
      const courses = courseService.useCourses()
      const state = useCentralStore.getState()
      const courseModules = state.getData("courseModules") || []

      const courseIds = courseModules.filter((cm) => cm.moduleId === moduleId).map((cm) => cm.courseId)

      return courses.filter((course) => courseIds.includes(course.id))
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao recuperar cursos do módulo")
      return []
    }
  }

  /**
   * ✅ Retrieves a course with its linked modules.
   * @param courseId - The course ID.
   * @returns Course object with modules.
   */
  getCourseWithModules(courseId: string): (Course & { modules: Module[] }) | null {
    try {
      const course = courseService.useCourses().find((c) => c.id === courseId)
      if (!course) {
        throw new Error("Curso não encontrado.")
      }

      const modules = this.getModulesForCourse(courseId)

      return { ...course, modules }
    } catch (error) {
      handleServiceErrorWithToast(error, "Erro ao recuperar curso com módulos")
      return null
    }
  }
}

export const courseModuleService = CourseModuleService.getInstance()
