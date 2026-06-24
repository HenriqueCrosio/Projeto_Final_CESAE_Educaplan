"use server";

import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/auth";

// ── Vitrine pública (C1) ──────────────────────────────────────────────
// A Organization é a instituição (org de professor solo = página do professor).
// Regra de acesso: a vitrine é só MONTRA — branding + catálogo de cursos
// publicados. O conteúdo (módulos/tópicos/exames) continua FECHADO por turma.

const URL_MAX = 500;
const HEADLINE_MAX = 120;
const DESCRIPTION_MAX = 2000;

/** Aceita só http(s) e limita o tamanho; devolve null para vazio/ inválido. */
function cleanUrl(raw: string | null | undefined): string | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  if (v.length > URL_MAX) throw new Error("URL demasiado longo.");
  let parsed: URL;
  try {
    parsed = new URL(v);
  } catch {
    throw new Error("URL inválido (inclua https://).");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Só são permitidos URLs http(s).");
  }
  return parsed.toString();
}

/** Normaliza uma cor hex (#rgb ou #rrggbb); null se vazio. */
function cleanHexColor(raw: string | null | undefined): string | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  const hex = v.startsWith("#") ? v : `#${v}`;
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) {
    throw new Error("Cor inválida — use um hex como #4f46e5.");
  }
  return hex.toLowerCase();
}

function cleanText(raw: string | null | undefined, max: number): string | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  if (v.length > max) throw new Error(`Texto demasiado longo (máx. ${max}).`);
  return v;
}

export interface OrgPublicProfileInput {
  isPublic: boolean;
  headline?: string | null;
  description?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
}

/** Lê o perfil público da org do professor autenticado (para o editor). */
export async function getMyOrgPublicProfile() {
  const { orgId } = await requireTeacher();
  return prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      slug: true,
      isPublic: true,
      headline: true,
      description: true,
      bannerUrl: true,
      logoUrl: true,
      brandColor: true,
    },
  });
}

/**
 * Atualiza o perfil público. Autorização: só OWNER/ADMIN da org (a vitrine
 * representa a instituição inteira, não um professor isolado).
 */
export async function updateOrgPublicProfile(input: OrgPublicProfileInput) {
  const { orgId, membershipRole } = await requireTeacher();
  if (membershipRole !== "OWNER" && membershipRole !== "ADMIN") {
    throw new Error("Sem permissão: só o dono ou um admin pode editar a página pública.");
  }

  const data = {
    isPublic: !!input.isPublic,
    headline: cleanText(input.headline, HEADLINE_MAX),
    description: cleanText(input.description, DESCRIPTION_MAX),
    bannerUrl: cleanUrl(input.bannerUrl),
    logoUrl: cleanUrl(input.logoUrl),
    brandColor: cleanHexColor(input.brandColor),
  };

  await prisma.organization.update({ where: { id: orgId }, data });
  return { ok: true };
}

/**
 * Leitura PÚBLICA por slug — NÃO exige sessão (a rota /p/[slug] está fora do
 * matcher do middleware). Devolve null se a org não existe ou não é pública.
 * Catálogo = só cursos publicados (publishStatus != PRIVATE); sem ligações ao
 * conteúdo fechado.
 */
export async function getPublicOrgBySlug(slug: string) {
  const clean = (slug ?? "").trim().toLowerCase();
  if (!clean) return null;

  const org = await prisma.organization.findFirst({
    where: { slug: clean, isPublic: true },
    select: {
      name: true,
      slug: true,
      headline: true,
      description: true,
      bannerUrl: true,
      logoUrl: true,
      brandColor: true,
      courses: {
        where: { publishStatus: { not: "PRIVATE" } },
        select: { id: true, name: true, description: true, category: true },
        orderBy: { name: "asc" },
      },
    },
  });

  return org;
}
