"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId, getCurrentOrganizationId } from "@/lib/auth";

export interface CreateTeamInput {
  name: string;
  description?: string | null;
  classId: string;
}

// Garante que a turma-pai pertence ao professor + organização da sessão.
async function assertOwnedClass(classId: string, organizationId: string, teacherId: string) {
  const klass = await prisma.class.findFirst({
    where: { id: classId, organizationId, teacherId },
    select: { id: true },
  });
  if (!klass) throw new Error("Turma inválida ou sem permissão.");
}

export async function createTeam(input: CreateTeamInput) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  const name = input.name?.trim();
  if (!name) throw new Error("O nome do time é obrigatório.");
  if (!input.classId) throw new Error("Selecione a turma à qual o time pertence.");

  await assertOwnedClass(input.classId, organizationId, teacherId);

  return prisma.team.create({
    data: {
      name,
      description: input.description?.toString().trim() || null,
      classId: input.classId,
      teacherId,
      organizationId,
    },
  });
}

export async function getTeamsByClass(classId: string) {
  const organizationId = await getCurrentOrganizationId();
  return prisma.team.findMany({
    where: { organizationId, classId },
    include: {
      students: { include: { user: { include: { profile: true } } } },
      _count: { select: { students: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function updateTeam(
  id: string,
  data: { name?: string; description?: string | null }
) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.team.updateMany({
    where: { id, organizationId, teacherId },
    data,
  });
}

export async function deleteTeam(id: string) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  const owned = await prisma.team.findFirst({
    where: { id, organizationId, teacherId },
    select: { id: true },
  });
  if (!owned) return { count: 0 };
  await prisma.team.update({ where: { id }, data: { students: { set: [] } } });
  await prisma.team.delete({ where: { id } });
  return { count: 1 };
}

/** Liga alunos (Student.id) a um time via M:N implícito. */
export async function addStudentsToTeam(teamId: string, studentIds: string[]) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  if (!studentIds.length) return { count: 0 };

  const owned = await prisma.team.findFirst({
    where: { id: teamId, organizationId, teacherId },
    select: { id: true },
  });
  if (!owned) throw new Error("Time inválido ou sem permissão.");

  await prisma.team.update({
    where: { id: teamId },
    data: { students: { connect: studentIds.map((id) => ({ id })) } },
  });
  return { count: studentIds.length };
}

export async function removeStudentFromTeam(teamId: string, studentId: string) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  const owned = await prisma.team.findFirst({
    where: { id: teamId, organizationId, teacherId },
    select: { id: true },
  });
  if (!owned) throw new Error("Time inválido ou sem permissão.");
  await prisma.team.update({
    where: { id: teamId },
    data: { students: { disconnect: { id: studentId } } },
  });
  return { count: 1 };
}
