"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId, getCurrentOrganizationId } from "@/lib/auth";
import type { MaterialType } from "@prisma/client";

export interface CreateMaterialInput {
  name: string;
  description?: string | null;
  url?: string | null;
  type: MaterialType;
  courseId?: string | null;
  moduleId?: string | null;
  topicId?: string | null;
}

export async function createMaterial(input: CreateMaterialInput) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  const name = input.name?.trim();
  if (!name) throw new Error("O nome do material é obrigatório.");

  // Valida os vínculos opcionais contra a organização.
  if (input.courseId) {
    const c = await prisma.course.findFirst({ where: { id: input.courseId, organizationId }, select: { id: true } });
    if (!c) throw new Error("Curso inválido ou sem permissão.");
  }
  if (input.moduleId) {
    const m = await prisma.module.findFirst({ where: { id: input.moduleId, organizationId }, select: { id: true } });
    if (!m) throw new Error("Módulo inválido ou sem permissão.");
  }
  if (input.topicId) {
    const t = await prisma.topic.findFirst({ where: { id: input.topicId, organizationId }, select: { id: true } });
    if (!t) throw new Error("Tópico inválido ou sem permissão.");
  }

  return prisma.material.create({
    data: {
      name,
      description: input.description?.toString().trim() || null,
      url: input.url?.toString().trim() || null,
      type: input.type,
      courseId: input.courseId || null,
      moduleId: input.moduleId || null,
      topicId: input.topicId || null,
      creatorId: teacherId,
      ownerId: teacherId,
      organizationId,
    },
  });
}

export async function getMyMaterials() {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.material.findMany({
    where: { organizationId, ownerId: teacherId },
    include: {
      course: { select: { name: true } },
      module: { select: { name: true } },
      topic: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateMaterial(
  id: string,
  data: Partial<Omit<CreateMaterialInput, "type">> & { type?: MaterialType }
) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.material.updateMany({
    where: { id, organizationId, ownerId: teacherId },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description?.toString().trim() || null } : {}),
      ...(data.url !== undefined ? { url: data.url?.toString().trim() || null } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.courseId !== undefined ? { courseId: data.courseId || null } : {}),
      ...(data.moduleId !== undefined ? { moduleId: data.moduleId || null } : {}),
      ...(data.topicId !== undefined ? { topicId: data.topicId || null } : {}),
    },
  });
}

export async function deleteMaterial(id: string) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  const owned = await prisma.material.findFirst({
    where: { id, organizationId, ownerId: teacherId },
    select: { id: true },
  });
  if (!owned) return { count: 0 };
  await prisma.material.delete({ where: { id } });
  return { count: 1 };
}
