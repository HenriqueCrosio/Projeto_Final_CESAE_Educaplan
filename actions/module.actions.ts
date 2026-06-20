"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId, getCurrentOrganizationId } from "@/lib/auth";
import { generateSlug } from "@/lib/utils/validation.utils";

export interface CreateModuleInput {
  name: string;
  description?: string | null;
  category: string;
  courseId: string;
  totalHours: number;
  averageHoursPerLesson: number;
}

async function uniqueModuleSlug(name: string): Promise<string> {
  const base = generateSlug(name, "module");
  let slug = base;
  let n = 1;
  while (await prisma.module.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

// Cria um módulo dentro de um curso (Opção A: 1 módulo pertence a 1 curso).
export async function createModule(input: CreateModuleInput) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  const name = input.name?.trim();
  const category = input.category?.trim();
  if (!name || !category) {
    throw new Error("Nome e categoria são obrigatórios.");
  }
  if (!input.courseId) {
    throw new Error("Selecione o curso ao qual o módulo pertence.");
  }

  // O curso-pai precisa pertencer ao professor + organização da sessão.
  const course = await prisma.course.findFirst({
    where: { id: input.courseId, organizationId, ownerId: teacherId },
    select: { id: true },
  });
  if (!course) {
    throw new Error("Curso inválido ou sem permissão.");
  }

  const slug = await uniqueModuleSlug(name);

  return prisma.module.create({
    data: {
      name,
      description: input.description?.toString().trim() || null,
      category,
      slug,
      totalHours: Math.max(0, Math.round(input.totalHours || 0)),
      averageHoursPerLesson: input.averageHoursPerLesson || 0,
      courseId: input.courseId,
      creatorId: teacherId,
      ownerId: teacherId,
      organizationId,
    },
  });
}

export async function getMyModules() {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.module.findMany({
    where: { organizationId, ownerId: teacherId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getModulesByCourse(courseId: string) {
  const organizationId = await getCurrentOrganizationId();
  return prisma.module.findMany({
    where: { organizationId, courseId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getModuleBySlug(slug: string) {
  const organizationId = await getCurrentOrganizationId();
  return prisma.module.findFirst({ where: { slug, organizationId } });
}

export async function getModuleCategories() {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  const rows = await prisma.module.findMany({
    where: { organizationId, ownerId: teacherId },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category).filter(Boolean);
}

export async function updateModule(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    category?: string;
    totalHours?: number;
    averageHoursPerLesson?: number;
  }
) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.module.updateMany({
    where: { id, organizationId, ownerId: teacherId },
    data,
  });
}

export async function deleteModule(id: string) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.module.deleteMany({
    where: { id, organizationId, ownerId: teacherId },
  });
}
