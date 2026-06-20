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

/**
 * Provisiona um usuário novo no primeiro login:
 * User + Profile + Teacher + Organization (onboarded=false) + Membership(OWNER),
 * tudo numa transação. Retorna o teacher e a organização para popular a sessão.
 */
export async function provisionNewUser(email: string, displayName?: string) {
  const localPart = email.split("@")[0] || "user";
  const orgBaseName = `Organização de ${displayName?.trim() || localPart}`;
  const baseSlug = slugify(displayName?.trim() || localPart);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { email } });

    await tx.profile.create({
      data: { userId: user.id, displayName: displayName?.trim() || localPart },
    });

    const teacher = await tx.teacher.create({ data: { userId: user.id } });

    // Garante slug único (org-base, org-base-2, ...).
    let slug = baseSlug;
    let suffix = 1;
    while (await tx.organization.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const organization = await tx.organization.create({
      data: { name: orgBaseName, slug },
    });

    await tx.membership.create({
      data: { userId: user.id, organizationId: organization.id, role: "OWNER" },
    });

    return { user, teacher, organization };
  });
}

/** Marca o onboarding como concluído e define o nome definitivo da organização. */
export async function completeOnboarding(name: string) {
  const session = await getSession();
  const organizationId = session?.user?.org_id;

  if (!session?.user || !organizationId) {
    throw new Error("Unauthorized: sessão sem organização.");
  }

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("O nome da organização é obrigatório.");
  }

  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: { name: trimmed, onboarded: true },
  });

  // Atualiza o claim na sessão (cookie) para o middleware não reenviar ao onboarding.
  session.user.onboarded = true;
  await updateSession(session);

  return organization;
}
