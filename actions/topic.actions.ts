"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId, getCurrentOrganizationId } from "@/lib/auth";

export interface CreateTopicInput {
  name: string;
  description?: string | null;
  moduleId: string;
  objectives: { description: string }[];
}

// Cria um tópico dentro de um módulo (Opção A). order = nº de tópicos existentes + 1.
export async function createTopic(input: CreateTopicInput) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  const name = input.name?.trim();
  if (!name) throw new Error("O nome do tópico é obrigatório.");
  if (!input.moduleId) throw new Error("Selecione o módulo ao qual o tópico pertence.");

  // O módulo-pai precisa pertencer ao professor + organização da sessão.
  const moduleParent = await prisma.module.findFirst({
    where: { id: input.moduleId, organizationId, ownerId: teacherId },
    select: { id: true },
  });
  if (!moduleParent) throw new Error("Módulo inválido ou sem permissão.");

  const count = await prisma.topic.count({ where: { moduleId: input.moduleId } });

  const objectives = (input.objectives || [])
    .map((o) => o.description?.trim())
    .filter((d): d is string => !!d)
    .map((description) => ({ description, organizationId }));

  return prisma.topic.create({
    data: {
      name,
      description: input.description?.toString().trim() || null,
      order: count + 1,
      moduleId: input.moduleId,
      organizationId,
      objectives: objectives.length ? { create: objectives } : undefined,
    },
    include: { objectives: true },
  });
}

export async function getMyTopics() {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.topic.findMany({
    where: { organizationId, module: { ownerId: teacherId } },
    include: { objectives: true, module: { select: { name: true } } },
    orderBy: { order: "asc" },
  });
}

export async function getTopicsByModule(moduleId: string) {
  const organizationId = await getCurrentOrganizationId();
  return prisma.topic.findMany({
    where: { organizationId, moduleId },
    include: { objectives: true },
    orderBy: { order: "asc" },
  });
}

export async function getTopicById(id: string) {
  const organizationId = await getCurrentOrganizationId();
  return prisma.topic.findFirst({
    where: { id, organizationId },
    include: { objectives: true, module: { select: { name: true } } },
  });
}

export async function updateTopic(
  id: string,
  data: { name?: string; description?: string | null }
) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.topic.updateMany({
    where: { id, organizationId, module: { ownerId: teacherId } },
    data,
  });
}

export async function deleteTopic(id: string) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  // Garante posse antes de apagar (objetivos saem em cascata? Objective não tem cascade,
  // então removemos manualmente dentro de uma transação).
  const topic = await prisma.topic.findFirst({
    where: { id, organizationId, module: { ownerId: teacherId } },
    select: { id: true },
  });
  if (!topic) return { count: 0 };

  await prisma.$transaction([
    prisma.objective.deleteMany({ where: { topicId: id } }),
    prisma.topic.delete({ where: { id } }),
  ]);
  return { count: 1 };
}
