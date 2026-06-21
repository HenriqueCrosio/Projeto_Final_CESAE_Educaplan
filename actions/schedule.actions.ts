"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId, getCurrentOrganizationId } from "@/lib/auth";

export interface ScheduleLessonInput {
  classId: string;
  lessonId: string;
  dateTime: string | Date;
  // Duração em minutos; se omitida, usa a duração da própria aula.
  duration?: number;
}

// include comum para enriquecer um agendamento (turma, aula, módulo, curso).
const scheduleInclude = {
  class: { select: { id: true, name: true, color: true } },
  lesson: {
    select: {
      id: true,
      name: true,
      module: { select: { id: true, name: true, course: { select: { id: true, name: true } } } },
    },
  },
} as const;

export async function scheduleLesson(input: ScheduleLessonInput) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  if (!input.classId) throw new Error("Selecione a turma.");
  if (!input.lessonId) throw new Error("Selecione a aula.");
  const dateTime = new Date(input.dateTime);
  if (isNaN(+dateTime)) throw new Error("Data/hora inválida.");

  // A turma tem de pertencer ao professor + org.
  const klass = await prisma.class.findFirst({
    where: { id: input.classId, organizationId, teacherId },
    select: { courseId: true },
  });
  if (!klass) throw new Error("Turma inválida ou sem permissão.");

  // A aula tem de pertencer a um módulo do curso DESTA turma (+ org).
  const lesson = await prisma.lesson.findFirst({
    where: { id: input.lessonId, organizationId, module: { courseId: klass.courseId } },
    select: { id: true, duration: true },
  });
  if (!lesson) throw new Error("Aula inválida para o curso desta turma.");

  const duration = input.duration ?? Math.round(lesson.duration) ?? 0;

  return prisma.lessonSchedule.create({
    data: {
      lessonId: input.lessonId,
      classId: input.classId,
      dateTime,
      duration,
      teacherId,
      organizationId,
    },
    include: scheduleInclude,
  });
}

/** Agendamentos de uma turma (ordenados por data). */
export async function getSchedulesByClass(classId: string) {
  const organizationId = await getCurrentOrganizationId();
  return prisma.lessonSchedule.findMany({
    where: { organizationId, classId },
    include: scheduleInclude,
    orderBy: { dateTime: "asc" },
  });
}

/**
 * Aulas do curso da turma que ainda NÃO foram agendadas para essa turma,
 * agrupáveis por módulo. "Por agendar" = sem LessonSchedule(lessonId, classId).
 */
export async function getUnscheduledLessonsForClass(classId: string) {
  const organizationId = await getCurrentOrganizationId();
  const klass = await prisma.class.findFirst({
    where: { id: classId, organizationId },
    select: { courseId: true },
  });
  if (!klass) return [];

  const lessons = await prisma.lesson.findMany({
    where: {
      organizationId,
      module: { courseId: klass.courseId },
      schedules: { none: { classId } },
    },
    select: {
      id: true,
      name: true,
      duration: true,
      order: true,
      module: { select: { id: true, name: true } },
    },
    orderBy: [{ module: { name: "asc" } }, { order: "asc" }],
  });
  return lessons;
}

/** Todos os agendamentos do professor (para o calendário). */
export async function getMySchedules() {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.lessonSchedule.findMany({
    where: { organizationId, teacherId },
    include: scheduleInclude,
    orderBy: { dateTime: "asc" },
  });
}

/** Agendamentos de hoje ainda não terminados (para o painel "Aulas" do dashboard). */
export async function getTodaySchedules() {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const schedules = await prisma.lessonSchedule.findMany({
    where: { organizationId, teacherId, dateTime: { gte: startOfDay, lte: endOfDay } },
    include: scheduleInclude,
    orderBy: { dateTime: "asc" },
  });

  // Mantém apenas as que ainda não terminaram (fim = início + duração).
  return schedules.filter((s) => {
    const end = new Date(s.dateTime.getTime() + s.duration * 60000);
    return end > now;
  });
}

export async function deleteSchedule(id: string) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  const owned = await prisma.lessonSchedule.findFirst({
    where: { id, organizationId, teacherId },
    select: { id: true },
  });
  if (!owned) return { count: 0 };
  await prisma.lessonSchedule.delete({ where: { id } });
  return { count: 1 };
}
