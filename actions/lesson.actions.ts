"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId, getCurrentOrganizationId } from "@/lib/auth";
import type { CourseStatusEnum } from "@prisma/client";

export interface CreateLessonInput {
  name: string;
  description?: string | null;
  duration: number; // em minutos
  order: number;
  moduleId: string;
}

async function assertModuleOwned(moduleId: string, teacherId: string, organizationId: string) {
  const moduleParent = await prisma.module.findFirst({
    where: { id: moduleId, organizationId, ownerId: teacherId },
    select: { id: true },
  });
  if (!moduleParent) throw new Error("Módulo inválido ou sem permissão.");
}

export async function createLesson(input: CreateLessonInput) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  if (!input.moduleId) throw new Error("Selecione o módulo da aula.");
  await assertModuleOwned(input.moduleId, teacherId, organizationId);

  return prisma.lesson.create({
    data: {
      name: input.name?.trim() || "Aula",
      description: input.description?.toString().trim() || null,
      duration: input.duration || 0,
      order: input.order,
      moduleId: input.moduleId,
      organizationId,
    },
    include: { topics: true },
  });
}

export async function getLessonsByModule(moduleId: string) {
  const organizationId = await getCurrentOrganizationId();
  return prisma.lesson.findMany({
    where: { organizationId, moduleId },
    include: { topics: true },
    orderBy: { order: "asc" },
  });
}

export async function getMyLessons() {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.lesson.findMany({
    where: { organizationId, module: { ownerId: teacherId } },
    select: { id: true },
  });
}

export async function updateLesson(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    duration?: number;
    order?: number;
    status?: CourseStatusEnum;
    topicIds?: string[];
  }
) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  const lesson = await prisma.lesson.findFirst({
    where: { id, organizationId, module: { ownerId: teacherId } },
    select: { id: true },
  });
  if (!lesson) return { count: 0 };

  const { topicIds, ...rest } = data;
  await prisma.lesson.update({
    where: { id },
    data: {
      ...rest,
      ...(topicIds ? { topics: { set: topicIds.map((tid) => ({ id: tid })) } } : {}),
    },
  });
  return { count: 1 };
}

export async function deleteLesson(id: string) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.lesson.deleteMany({
    where: { id, organizationId, module: { ownerId: teacherId } },
  });
}
