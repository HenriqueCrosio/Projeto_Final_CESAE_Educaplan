"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId, getCurrentOrganizationId } from "@/lib/auth";
import type { ExerciseTypeEnum, DifficultyLevelEnum } from "@prisma/client";

export interface CreateExerciseInput {
  title: string;
  description?: string | null;
  content: string;
  type: ExerciseTypeEnum;
  difficulty: DifficultyLevelEnum;
  points: number;
  timeLimit?: number | null;
  topicId?: string | null;
  isTeamExercise?: boolean;
}

export async function createExercise(input: CreateExerciseInput) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  const title = input.title?.trim();
  if (!title) throw new Error("O título do exercício é obrigatório.");
  if (!input.content?.trim()) throw new Error("O enunciado/conteúdo é obrigatório.");

  // Se um tópico for indicado, tem de pertencer à organização.
  if (input.topicId) {
    const topic = await prisma.topic.findFirst({
      where: { id: input.topicId, organizationId },
      select: { id: true },
    });
    if (!topic) throw new Error("Tópico inválido ou sem permissão.");
  }

  return prisma.exercise.create({
    data: {
      title,
      description: input.description?.toString().trim() || null,
      content: input.content.trim(),
      type: input.type,
      difficulty: input.difficulty,
      points: Number(input.points) || 0,
      timeLimit: input.timeLimit ? Number(input.timeLimit) : null,
      topicId: input.topicId || null,
      isTeamExercise: !!input.isTeamExercise,
      creatorId: teacherId,
      ownerId: teacherId,
      organizationId,
    },
  });
}

export async function getMyExercises() {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.exercise.findMany({
    where: { organizationId, ownerId: teacherId },
    include: { topic: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getExerciseById(id: string) {
  const organizationId = await getCurrentOrganizationId();
  return prisma.exercise.findFirst({
    where: { id, organizationId },
    include: { topic: { select: { name: true } } },
  });
}

export async function updateExercise(
  id: string,
  data: Partial<Omit<CreateExerciseInput, "type" | "difficulty">> & {
    type?: ExerciseTypeEnum;
    difficulty?: DifficultyLevelEnum;
  }
) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.exercise.updateMany({
    where: { id, organizationId, ownerId: teacherId },
    data: {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description?.toString().trim() || null } : {}),
      ...(data.content !== undefined ? { content: data.content.trim() } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.difficulty !== undefined ? { difficulty: data.difficulty } : {}),
      ...(data.points !== undefined ? { points: Number(data.points) || 0 } : {}),
      ...(data.timeLimit !== undefined ? { timeLimit: data.timeLimit ? Number(data.timeLimit) : null } : {}),
      ...(data.isTeamExercise !== undefined ? { isTeamExercise: !!data.isTeamExercise } : {}),
    },
  });
}

export async function deleteExercise(id: string) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  const owned = await prisma.exercise.findFirst({
    where: { id, organizationId, ownerId: teacherId },
    select: { id: true },
  });
  if (!owned) return { count: 0 };
  // Remove vínculos M:N (ExamExercise) antes de apagar.
  await prisma.examExercise.deleteMany({ where: { exerciseId: id } });
  await prisma.exercise.delete({ where: { id } });
  return { count: 1 };
}
