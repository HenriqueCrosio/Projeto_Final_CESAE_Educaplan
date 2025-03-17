import { useCentralStore } from "@/store/central.store";
import { formatDateTime } from "@/lib/utils"; // ✅ Import date formatting utility
import type { ClassScheduleLessons } from "@/types/interfaces";

class ScheduleService {
  private static instance: ScheduleService | null = null;
  private teacherId = "cm6bntysq0005s911c7r7o87g"; // ✅ Hardcoded teacher ID

  private constructor() {}

  public static getInstance(): ScheduleService {
    if (!ScheduleService.instance) {
      ScheduleService.instance = new ScheduleService();
    }
    return ScheduleService.instance;
  }

  public getUnlecturedModuleLessons(enrollmentSlug: string, moduleId: string): any[] {
    const store = useCentralStore.getState();
    const enrollment = store.data.enrollments.find((e) => e.slug === enrollmentSlug);
    if (!enrollment) return [];

    const courseModule = store.data.courseModules.find(
      (cm) => cm.moduleId === moduleId && cm.courseId === enrollment.courseId
    );
    if (!courseModule) return [];

    const moduleLessons = store.data.moduleLessons.filter((ml) => ml.moduleId === moduleId && !ml.lectured);
    return moduleLessons
      .map((ml) => {
        const lesson = store.data.lessons.find((l) => l.id === ml.lessonId);
        return { ...ml, ...lesson };
      })
      .sort((a, b) => a.order - b.order);
  }

  public getUnlecturedLessonsForEnrollment(enrollmentSlug: string): any[] {
    const store = useCentralStore.getState();
    const enrollment = store.data.enrollments.find((e) => e.slug === enrollmentSlug);
    if (!enrollment) return [];

    const courseModules = store.data.courseModules.filter((cm) => cm.courseId === enrollment.courseId);
    const allUnlecturedLessons = courseModules.flatMap((cm) =>
      this.getUnlecturedModuleLessons(enrollmentSlug, cm.moduleId)
    );

    return allUnlecturedLessons.sort((a, b) => a.order - b.order);
  }

  public applyScheduleToLesson(
    enrollmentSlug: string,
    moduleId: string,
    classId: string,
    lessonId: string,
    startDate: Date,
    startTime: string
  ): ClassScheduleLessons | null {
    const store = useCentralStore.getState();
    const lessons = this.getUnlecturedModuleLessons(enrollmentSlug, moduleId);
    const selectedLesson = lessons.find((lesson) => lesson.id === lessonId);

    if (!selectedLesson) return null;

    // Parse the given start time
    const [hours, minutes] = startTime.split(":").map(Number);
    const lessonStartTime = new Date(startDate);
    lessonStartTime.setHours(hours, minutes, 0, 0);

    // Calculate the end time
    const lessonEndTime = new Date(lessonStartTime.getTime() + selectedLesson.duration * 60000);

    const scheduledLesson: ClassScheduleLessons = {
      id: `schl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      classId,
      lessonId,
      courseId: selectedLesson.courseId,
      moduleId,
      teacherId: this.teacherId, // ✅ Hardcoded teacher ID applied
      createdAt: new Date(),
      updatedAt: new Date(),
      enrollmentId: enrollmentSlug,
      duration: selectedLesson.duration,
      startTime: lessonStartTime,
      endTime: lessonEndTime,
    };

    // Update the store with the new scheduled lesson (only this one)
    store.setData("classScheduleLessons", [...store.data.classScheduleLessons, scheduledLesson]);

    return scheduledLesson;
  }

  public getScheduledLessons(enrollmentSlug: string, moduleId: string): ClassScheduleLessons[] {
    const store = useCentralStore.getState();
    return store.data.classScheduleLessons
      .filter(
        (schl) => schl.enrollmentId === enrollmentSlug && schl.moduleId === moduleId && schl.teacherId === this.teacherId
      )
      .map((lesson) => ({
        ...lesson,
        formattedStartTime: formatDateTime(lesson.startTime), // ✅ European date format applied
        formattedEndTime: lesson.endTime ? formatDateTime(lesson.endTime) : "Not set",
      }));
  }

  public updateScheduledLesson(updatedLesson: ClassScheduleLessons): boolean {
    const store = useCentralStore.getState();
    const index = store.data.classScheduleLessons.findIndex((schl) => schl.id === updatedLesson.id);

    if (index === -1) return false;

    const updatedScheduleLessons = [...store.data.classScheduleLessons];
    updatedScheduleLessons[index] = updatedLesson;
    store.setData("classScheduleLessons", updatedScheduleLessons);

    return true;
  }

  public deleteScheduledLesson(lessonId: string): boolean {
    const store = useCentralStore.getState();
    const updatedScheduleLessons = store.data.classScheduleLessons.filter((schl) => schl.id !== lessonId);

    if (updatedScheduleLessons.length === store.data.classScheduleLessons.length) return false;

    store.setData("classScheduleLessons", updatedScheduleLessons);
    return true;
  }

  public getTodaysLessons(): ClassScheduleLessons[] {
    const store = useCentralStore.getState();
    const now = new Date();

    return store.getData("classScheduleLessons")
      .filter((lesson) => 
        lesson.teacherId === this.teacherId &&
        new Date(lesson.startTime) <= now &&
        (!lesson.endTime || new Date(lesson.endTime) > now)
      )
      .map((lesson) => ({
        ...lesson,
        formattedStartTime: formatDateTime(lesson.startTime),
        formattedEndTime: lesson.endTime ? formatDateTime(lesson.endTime) : "Not set",
      }));
  }

  public refreshLessons() {
    const store = useCentralStore.getState();
    const newLessons = this.getTodaysLessons();
    const prevLessons = store.getData("activeLessons");

    if (JSON.stringify(prevLessons) !== JSON.stringify(newLessons)) {
      store.setData("activeLessons", newLessons);
    }
  }

  public getClassDetails(classId: string) {
    const store = useCentralStore.getState();
    return store.getData("classes").find((cls) => cls.id === classId);
  }
}

export const scheduleService = ScheduleService.getInstance();
