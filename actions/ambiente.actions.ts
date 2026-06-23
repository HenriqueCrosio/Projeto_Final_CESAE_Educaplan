"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentStudentId } from "@/lib/auth";
import type { StudentResourceKind } from "@prisma/client";

/**
 * Ambiente de estudo do aluno (B2): embeds lo-fi (YouTube/Spotify) e links
 * próprios. O tipo é detetado a partir da url; o embed é construído na UI.
 */

function detectKind(url: string): StudentResourceKind {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "YOUTUBE";
  if (u.includes("open.spotify.com") || u.includes("spotify:")) return "SPOTIFY";
  return "LINK";
}

export async function getMyResources() {
  const studentId = await getCurrentStudentId();
  return prisma.studentResource.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });
}

export type AddResourceResult = { ok: true } | { ok: false; error: string };

export async function addResource(title: string, url: string): Promise<AddResourceResult> {
  const studentId = await getCurrentStudentId();
  const t = title.trim().slice(0, 100);
  const u = url.trim();
  if (!t) return { ok: false, error: "Dá um nome ao recurso." };
  if (!/^https?:\/\/.+/i.test(u)) return { ok: false, error: "URL inválido (tem de começar por http)." };

  const count = await prisma.studentResource.count({ where: { studentId } });
  if (count >= 30) return { ok: false, error: "Limite de 30 recursos atingido." };

  await prisma.studentResource.create({
    data: { studentId, kind: detectKind(u), title: t, url: u },
  });
  return { ok: true };
}

export async function deleteResource(id: string): Promise<void> {
  const studentId = await getCurrentStudentId();
  await prisma.studentResource.deleteMany({ where: { id, studentId } });
}
