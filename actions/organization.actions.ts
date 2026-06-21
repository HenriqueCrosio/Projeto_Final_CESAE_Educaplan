"use server";

import { getSession, updateSession } from "@auth0/nextjs-auth0";
import { prisma } from "@/lib/prisma";

// Gera um slug seguro a partir de um texto livre.
function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove diacríticos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "org";
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
 * 1º login: cria apenas User + Profile (conta "pendente", sem persona).
 * A persona (professor/instituição vs aluno) é escolhida no onboarding.
 */
export async function provisionPendingUser(email: string, displayName?: string | null) {
  const localPart = email.split("@")[0] || "user";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email } });
    await prisma.profile.create({
      data: { userId: user.id, displayName: displayName?.trim() || localPart },
    });
  }
  return user;
}

/**
 * Onboarding como PROFESSOR/INSTITUIÇÃO: cria Teacher + Organization(onboarded=true)
 * + Membership(OWNER) e atualiza a sessão. A persona é só hint; a autorização real
 * deriva do Membership.role na BD.
 */
export async function completeTeacherOnboarding(name: string) {
  const session = await getSession();
  const email = session?.user?.email as string | undefined;
  if (!session?.user || !email) throw new Error("Unauthorized: sessão sem utilizador.");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("O nome da organização é obrigatório.");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Utilizador não encontrado.");

  const baseSlug = slugify(trimmed);

  const { teacher, organization } = await prisma.$transaction(async (tx) => {
    const teacher = (await tx.teacher.findUnique({ where: { userId: user.id } }))
      ?? (await tx.teacher.create({ data: { userId: user.id } }));

    let slug = baseSlug;
    let suffix = 1;
    while (await tx.organization.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const organization = await tx.organization.create({
      data: { name: trimmed, slug, onboarded: true },
    });

    await tx.membership.create({
      data: { userId: user.id, organizationId: organization.id, role: "OWNER" },
    });

    return { teacher, organization };
  });

  session.user.role = "teacher";
  session.user.id = teacher.id;
  session.user.org_id = organization.id;
  session.user.onboarded = true;
  await updateSession(session);

  return { redirectTo: "/dashboard" };
}

/**
 * Onboarding como ALUNO: cria o registo Student (global, sem professor/org)
 * e atualiza a sessão. O aluno fica sem org até ser matriculado por um professor.
 */
export async function completeStudentOnboarding(name: string) {
  const session = await getSession();
  const email = session?.user?.email as string | undefined;
  if (!session?.user || !email) throw new Error("Unauthorized: sessão sem utilizador.");

  const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
  if (!user) throw new Error("Utilizador não encontrado.");

  const trimmed = name.trim();
  if (trimmed) {
    if (user.profile) {
      await prisma.profile.update({ where: { userId: user.id }, data: { displayName: trimmed } });
    } else {
      await prisma.profile.create({ data: { userId: user.id, displayName: trimmed } });
    }
  }

  const year = new Date().getFullYear();
  const student =
    (await prisma.student.findUnique({ where: { userId: user.id } })) ??
    (await prisma.student.create({
      data: {
        userId: user.id,
        studentId: await generateUniqueStudentId(year),
        enrollYear: year,
        // addedById fica null: aluno self-signup (sem professor).
      },
    }));

  session.user.role = "student";
  session.user.id = student.id;
  session.user.org_id = undefined;
  session.user.onboarded = true;
  await updateSession(session);

  return { redirectTo: "/student" };
}
