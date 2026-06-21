"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId, getCurrentOrganizationId } from "@/lib/auth";

export interface AddStudentInput {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

// Gera um número de aluno único e legível: <ano>-<6 dígitos>.
async function generateUniqueStudentId(year: number): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const random = Math.floor(100000 + Math.random() * 900000);
    const candidate = `${year}-${random}`;
    const exists = await prisma.student.findUnique({ where: { studentId: candidate } });
    if (!exists) return candidate;
  }
  throw new Error("Não foi possível gerar um número de aluno único.");
}

/**
 * Adiciona um aluno por email à organização do professor logado (modo "Classroom").
 *
 * Lógica multi-tenant / claimable:
 * - Reusa o User se o email já existir (a mesma pessoa pode ser aluno de vários
 *   professores/orgs e ainda ter o seu próprio hub); senão cria um User "pendente"
 *   (sem Auth0) que será reivindicado quando fizer login com esse email.
 * - Garante Membership(STUDENT) nesta organização.
 * - Garante o registo académico Student (global, 1 por User: Student.userId é @unique).
 */
export async function addStudent(input: AddStudentInput) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  const email = input.email?.trim().toLowerCase();
  if (!email) throw new Error("O email do aluno é obrigatório.");

  const firstName = input.firstName?.toString().trim() || null;
  const lastName = input.lastName?.toString().trim() || null;
  const displayName = `${firstName ?? ""} ${lastName ?? ""}`.trim() || null;
  const year = new Date().getFullYear();

  return prisma.$transaction(async (tx) => {
    // 1. User: reusa por email ou cria pendente.
    let user = await tx.user.findUnique({ where: { email } });
    if (!user) {
      user = await tx.user.create({ data: { email } });
      if (displayName || firstName || lastName) {
        await tx.profile.create({
          data: { userId: user.id, firstName, lastName, displayName },
        });
      }
    }

    // 2. Membership(STUDENT) nesta org — não rebaixa um OWNER/ADMIN existente.
    const membership = await tx.membership.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId } },
    });
    if (!membership) {
      await tx.membership.create({
        data: { userId: user.id, organizationId, role: "STUDENT" },
      });
    }

    // 3. Student global (1 por User). Reusa se já existir (aluno noutra org).
    let student = await tx.student.findUnique({ where: { userId: user.id } });
    if (!student) {
      const studentId = await generateUniqueStudentId(year);
      student = await tx.student.create({
        data: {
          userId: user.id,
          studentId,
          enrollYear: year,
          addedById: teacherId,
        },
      });
    }

    return { user, student };
  });
}

/** Alunos da organização do professor logado (via Membership STUDENT na org). */
export async function getMyStudents() {
  await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.student.findMany({
    where: { user: { memberships: { some: { organizationId } } } },
    include: { user: { include: { profile: true } } },
    orderBy: { createdAt: "asc" },
  });
}
