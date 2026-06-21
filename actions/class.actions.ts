"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId, getCurrentOrganizationId } from "@/lib/auth";

export interface CreateClassInput {
  name: string;
  color?: string | null;
  description?: string | null;
  courseId: string;
}

// Garante que o curso-pai pertence ao professor + organização da sessão.
async function assertOwnedCourse(courseId: string, organizationId: string, teacherId: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, organizationId, ownerId: teacherId },
    select: { id: true },
  });
  if (!course) throw new Error("Curso inválido ou sem permissão.");
}

export async function createClass(input: CreateClassInput) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  const name = input.name?.trim();
  if (!name) throw new Error("O nome da turma é obrigatório.");
  if (!input.courseId) throw new Error("Selecione o curso ao qual a turma pertence.");

  await assertOwnedCourse(input.courseId, organizationId, teacherId);

  return prisma.class.create({
    data: {
      name,
      color: input.color?.toString().trim() || null,
      description: input.description?.toString().trim() || null,
      courseId: input.courseId,
      teacherId,
      organizationId,
    },
  });
}

export async function getMyClasses() {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.class.findMany({
    where: { organizationId, teacherId },
    include: {
      course: { select: { name: true } },
      _count: { select: { students: true, teams: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getClassesByCourse(courseId: string) {
  const organizationId = await getCurrentOrganizationId();
  return prisma.class.findMany({
    where: { organizationId, courseId },
    include: { _count: { select: { students: true, teams: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getClassById(id: string) {
  const organizationId = await getCurrentOrganizationId();
  return prisma.class.findFirst({
    where: { id, organizationId },
    include: {
      course: { select: { name: true } },
      students: { include: { user: { include: { profile: true } } } },
      teams: { include: { _count: { select: { students: true } } } },
    },
  });
}

export async function updateClass(
  id: string,
  data: { name?: string; color?: string | null; description?: string | null }
) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.class.updateMany({
    where: { id, organizationId, teacherId },
    data,
  });
}

export async function deleteClass(id: string) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  // Desliga alunos/times (M:N) antes de apagar para não violar relações.
  const owned = await prisma.class.findFirst({
    where: { id, organizationId, teacherId },
    select: { id: true },
  });
  if (!owned) return { count: 0 };
  await prisma.class.update({
    where: { id },
    data: { students: { set: [] } },
  });
  await prisma.class.delete({ where: { id } });
  return { count: 1 };
}

/** Liga alunos (Student.id) a uma turma via M:N implícito. */
export async function addStudentsToClass(classId: string, studentIds: string[]) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  if (!studentIds.length) return { count: 0 };

  const owned = await prisma.class.findFirst({
    where: { id: classId, organizationId, teacherId },
    select: { id: true },
  });
  if (!owned) throw new Error("Turma inválida ou sem permissão.");

  await prisma.class.update({
    where: { id: classId },
    data: { students: { connect: studentIds.map((id) => ({ id })) } },
  });
  return { count: studentIds.length };
}

export async function removeStudentFromClass(classId: string, studentId: string) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  const owned = await prisma.class.findFirst({
    where: { id: classId, organizationId, teacherId },
    select: { id: true },
  });
  if (!owned) throw new Error("Turma inválida ou sem permissão.");
  await prisma.class.update({
    where: { id: classId },
    data: { students: { disconnect: { id: studentId } } },
  });
  return { count: 1 };
}
