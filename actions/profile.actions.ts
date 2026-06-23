"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

/**
 * Nome de exibição do utilizador (Profile.displayName). Útil para contas
 * "reivindicadas" (pré-convidadas por um professor) que saltaram o onboarding e
 * por isso não têm nome — a saudação cairia no email.
 */
export async function setMyDisplayName(name: string): Promise<string> {
  const trimmed = name.trim().replace(/\s+/g, " ").slice(0, 60);
  if (!trimmed) throw new Error("O nome não pode ficar vazio.");
  const userId = await getCurrentUserId();
  await prisma.profile.upsert({
    where: { userId },
    create: { userId, displayName: trimmed },
    update: { displayName: trimmed },
  });
  return trimmed;
}
