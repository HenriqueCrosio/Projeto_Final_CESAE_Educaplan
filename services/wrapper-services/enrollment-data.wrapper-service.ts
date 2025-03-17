/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCentralStore } from "@/store/central.store";
import { Lesson, Topic } from "@/types/interfaces"

// Interface defining the structured response
export interface EnrollmentDetails {
  enrollment: any;
  courseModules: any[];
  modules: any[];
  moduleTopics: any[];
  topics: any[];
  classes: any[];
  classStudents: any[];
  moduleAssignments: any[];
  moduleLessons: any[];
  lessons: any[];
  users: any[];
}

class EnrollmentDataService {
  private static instance: EnrollmentDataService | null = null
  private teacherId = "cm6bntysq0005s911c7r7o87g" // Hardcoded teacher ID

  private constructor() {}

  public static getInstance(): EnrollmentDataService {
    if (!EnrollmentDataService.instance) {
      EnrollmentDataService.instance = new EnrollmentDataService()
    }
    return EnrollmentDataService.instance
  }

  /**
   * ✅ Fetch all related data for an enrollment using its slug.
   * @param enrollmentSlug - The slug of the enrollment.
   * @returns EnrollmentDetails | null
   */
  public getEnrollmentDetailsBySlug(enrollmentSlug: string): EnrollmentDetails | null {
    const store = useCentralStore.getState().data

    // Step 1: Find Enrollment
    const enrollment = store.enrollments.find((enr) => enr.slug === enrollmentSlug)
    if (!enrollment) {
      console.error(`Enrollment not found for slug: ${enrollmentSlug}`)
      return null
    }

    // Step 2: Find Course Modules linked to this enrollment's course
    const courseModules = store.courseModules.filter((cm) => cm.courseId === enrollment.courseId)

    // Step 3: Fetch Modules linked to the Course
    const moduleIds = courseModules.map((cm) => cm.moduleId)
    const modules = store.modules.filter((mod) => moduleIds.includes(mod.id))

    // Step 4: Fetch Module Topics linked to the Modules
    const moduleTopics = store.moduleTopics.filter((mt) => moduleIds.includes(mt.moduleId))

    // Step 5: Fetch Topics linked to the Module Topics
    const topicIds = moduleTopics.map((mt) => mt.topicId)
    const topics = store.topics.filter((t) => topicIds.includes(t.id))

    // Step 6: Fetch Classes linked to the Enrollment
    const classes = store.classes.filter((cls) => enrollment.classIds?.includes(cls.id))

    // Step 7: Fetch Students linked to the Classes
    const classStudents = store.classStudents.filter((cs) => enrollment.classIds?.includes(cs.classId))

    // Step 8: Fetch Module Assignments linked to Modules
    const moduleAssignments = store.moduleAssignments.filter((ma) => moduleIds.includes(ma.moduleId))

    // Step 9: Fetch Module Lessons linked to Modules
    const moduleLessons = store.moduleLessons.filter((ml) => moduleIds.includes(ml.moduleId))

    // Step 10: Fetch Lessons linked to Module Lessons
    const lessonIds = moduleLessons.map((ml) => ml.lessonId)
    const lessons = store.lessons.filter((l) => lessonIds.includes(l.id))

    // Step 11: Fetch Users (linked to class students)
    const userIds = classStudents.map((cs) => cs.studentId)
    const users = store.users.filter((u) => userIds.includes(u.id))

    return {
      enrollment,
      courseModules,
      modules,
      moduleTopics,
      topics,
      classes,
      classStudents,
      moduleAssignments,
      moduleLessons,
      lessons,
      users,
    }
  }

  /**
   * Edit a lesson
   * @param lessonId - The ID of the lesson to edit
   * @param updates - An object containing the updates to apply to the lesson
   * @returns boolean - True if the edit was successful, false otherwise
   */
  public editLesson(lessonId: string, updates: Partial<Lesson>): boolean {
    const store = useCentralStore.getState()
    const lessonIndex = store.data.lessons.findIndex((lesson) => lesson.id === lessonId)

    if (lessonIndex === -1) {
      console.error(`Lesson not found with ID: ${lessonId}`)
      return false
    }

    // Update the lesson
    const updatedLessons = [...store.data.lessons]
    updatedLessons[lessonIndex] = { ...updatedLessons[lessonIndex], ...updates }

    // If duration has changed, update the module's allocated minutes
    if (updates.duration !== undefined) {
      const moduleLesson = store.data.moduleLessons.find((ml) => ml.lessonId === lessonId)
      if (moduleLesson) {
        const moduleIndex = store.data.modules.findIndex((m) => m.id === moduleLesson.moduleId)
        if (moduleIndex !== -1) {
          const oldDuration = store.data.lessons[lessonIndex].duration || 0
          const durationDiff = updates.duration - oldDuration
          const updatedModules = [...store.data.modules]
          updatedModules[moduleIndex] = {
            ...updatedModules[moduleIndex],
            totalMinutes: (updatedModules[moduleIndex].totalMinutes || 0) + durationDiff,
          }
          store.setData("modules", updatedModules)
        }
      }
    }

    // Update the store
    store.setData("lessons", updatedLessons)
    return true
  }

  /**
   * Delete a lesson
   * @param lessonId - The ID of the lesson to delete
   * @returns boolean - True if the deletion was successful, false otherwise
   */
  public deleteLesson(lessonId: string): boolean {
    const store = useCentralStore.getState()
    const lessonIndex = store.data.lessons.findIndex((lesson) => lesson.id === lessonId)

    if (lessonIndex === -1) {
      console.error(`Lesson not found with ID: ${lessonId}`)
      return false
    }

    // Remove the lesson's duration from the module's allocated minutes
    const moduleLesson = store.data.moduleLessons.find((ml) => ml.lessonId === lessonId)
    if (moduleLesson) {
      const moduleIndex = store.data.modules.findIndex((m) => m.id === moduleLesson.moduleId)
      if (moduleIndex !== -1) {
        const updatedModules = [...store.data.modules]
        updatedModules[moduleIndex] = {
          ...updatedModules[moduleIndex],
          totalMinutes:
            (updatedModules[moduleIndex].totalMinutes || 0) - (store.data.lessons[lessonIndex].duration || 0),
        }
        store.setData("modules", updatedModules)
      }
    }

    // Remove the lesson
    const updatedLessons = store.data.lessons.filter((lesson) => lesson.id !== lessonId)
    store.setData("lessons", updatedLessons)

    // Remove associated moduleLesson entry
    const updatedModuleLessons = store.data.moduleLessons.filter((ml) => ml.lessonId !== lessonId)
    store.setData("moduleLessons", updatedModuleLessons)

    return true
  }

  /**
   * Add topics to a lesson
   * @param lessonId - The ID of the lesson
   * @param topicIds - An array of topic IDs to add
   * @returns boolean - True if the addition was successful, false otherwise
   */
  public addTopicsToLesson(lessonId: string, topicIds: string[]): boolean {
    const store = useCentralStore.getState()
    const lessonIndex = store.data.lessons.findIndex((l) => l.id === lessonId)

    if (lessonIndex === -1) {
      console.error(`Lesson not found with ID: ${lessonId}`)
      return false
    }

    // Add new topics
    const updatedLessons = [...store.data.lessons]
    updatedLessons[lessonIndex] = {
      ...updatedLessons[lessonIndex],
      topics: [
        ...(updatedLessons[lessonIndex].topics || []),
        ...store.data.topics.filter((topic) => topicIds.includes(topic.id)),
      ],
    }

    // Update the store
    store.setData("lessons", updatedLessons)
    return true
  }

  /**
   * Remove topics from a lesson
   * @param lessonId - The ID of the lesson
   * @param topicIds - An array of topic IDs to remove
   * @returns boolean - True if the removal was successful, false otherwise
   */
  public removeTopicsFromLesson(lessonId: string, topicIds: string[]): boolean {
    const store = useCentralStore.getState()
    const lessonIndex = store.data.lessons.findIndex((l) => l.id === lessonId)

    if (lessonIndex === -1) {
      console.error(`Lesson not found with ID: ${lessonId}`)
      return false
    }

    // Remove topics
    const updatedLessons = [...store.data.lessons]
    updatedLessons[lessonIndex] = {
      ...updatedLessons[lessonIndex],
      topics: updatedLessons[lessonIndex].topics?.filter((topic: Topic) => !topicIds.includes(topic.id)),
    }

    // Update the store
    store.setData("lessons", updatedLessons)
    return true
  }

  /**
   * Adjust lesson duration
   * @param lessonId - The ID of the lesson
   * @param newDuration - The new duration in minutes
   * @returns boolean - True if the adjustment was successful, false otherwise
   */
  public adjustLessonDuration(lessonId: string, newDuration: number): boolean {
    return this.editLesson(lessonId, { duration: newDuration })
  }
}

export const enrollmentDataService = EnrollmentDataService.getInstance()





