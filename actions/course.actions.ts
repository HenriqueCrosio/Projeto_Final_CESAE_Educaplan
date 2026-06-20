"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId, getCurrentOrganizationId } from "@/lib/auth";
import { generateSlug } from "@/lib/utils/validation.utils";

export interface CreateCourseInput {
  name: string;
  description?: string | null;
  category: string;
}

// Garante um slug único (o campo Course.slug é @unique global).
async function uniqueCourseSlug(name: string): Promise<string> {
  const base = generateSlug(name, "course");
  let slug = base;
  let n = 1;
  while (await prisma.course.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

// Cria um curso atribuindo automaticamente teacher (criador/dono) e organização da sessão.
export async function createCourse(input: CreateCourseInput) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  const name = input.name?.trim();
  const category = input.category?.trim();
  if (!name || !category) {
    throw new Error("Nome e categoria são obrigatórios.");
  }

  const slug = await uniqueCourseSlug(name);

  return prisma.course.create({
    data: {
      name,
      description: input.description?.toString().trim() || null,
      category,
      slug,
      creatorId: teacherId,
      ownerId: teacherId,
      organizationId,
    },
  });
}

// Lista os cursos do professor logado, dentro da sua organização.
export async function getMyCourses() {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  return prisma.course.findMany({
    where: { organizationId, ownerId: teacherId },
    orderBy: { createdAt: "desc" },
  });
}

// Busca um curso por slug, restrito à organização da sessão.
export async function getCourseBySlug(slug: string) {
  const organizationId = await getCurrentOrganizationId();
  return prisma.course.findFirst({ where: { slug, organizationId } });
}

// Categorias distintas usadas pelos cursos do professor.
export async function getCourseCategories() {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  const rows = await prisma.course.findMany({
    where: { organizationId, ownerId: teacherId },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category).filter(Boolean);
}

// Atualiza um curso (apenas se pertencer ao professor + organização da sessão).
export async function updateCourse(
  id: string,
  data: { name?: string; description?: string | null; category?: string }
) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  return prisma.course.updateMany({
    where: { id, organizationId, ownerId: teacherId },
    data,
  });
}

// Exclui um curso (apenas se pertencer ao professor + organização da sessão).
export async function deleteCourse(id: string) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  return prisma.course.deleteMany({
    where: { id, organizationId, ownerId: teacherId },
  });
}
