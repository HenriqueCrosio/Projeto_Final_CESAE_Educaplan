"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

const THEMES = ["light", "dark", "system"] as const;
export type ThemePref = (typeof THEMES)[number];

/** Preferências do utilizador autenticado (null se ainda não existir registo). */
export async function getMyPreferences() {
  const userId = await getCurrentUserId();
  return prisma.userPreferences.findUnique({ where: { userId } });
}

/**
 * Tema persistido do utilizador autenticado. Best-effort: devolve null para
 * sessões não autenticadas (páginas públicas) em vez de lançar, para poder ser
 * chamado no layout raiz que envolve toda a app.
 */
export async function getStoredTheme(): Promise<ThemePref | null> {
  try {
    const prefs = await getMyPreferences();
    return (prefs?.theme as ThemePref) ?? null;
  } catch {
    return null;
  }
}

/** Persiste o tema escolhido (upsert 1:1 User). */
export async function setMyTheme(theme: string): Promise<void> {
  if (!THEMES.includes(theme as ThemePref)) {
    throw new Error(`Tema inválido: ${theme}`);
  }
  const userId = await getCurrentUserId();
  await prisma.userPreferences.upsert({
    where: { userId },
    create: { userId, theme },
    update: { theme },
  });
}
