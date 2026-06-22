"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId, getCurrentOrganizationId } from "@/lib/auth";
import type { ExerciseTypeEnum, DifficultyLevelEnum } from "@prisma/client";

export interface ExerciseOptionInput {
  text: string;
  isCorrect: boolean;
}

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
  // Gabarito (só MC/TF). Opcional ao criar — pode ser definido depois.
  options?: ExerciseOptionInput[];
}

/** Tipos cujo gabarito é auto-corrigível por opções (S3: resposta única). */
function usesOptions(type: ExerciseTypeEnum) {
  return type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE";
}

/**
 * Normaliza e valida o gabarito. Regra do S3: ou não há opções (rascunho, sem
 * auto-correção), ou há >=2 opções com EXATAMENTE 1 correta. Tipos sem opções
 * não podem ter gabarito. Devolve as opções limpas (texto aparado, vazias fora).
 */
function normalizeOptions(type: ExerciseTypeEnum, options: ExerciseOptionInput[] = []): ExerciseOptionInput[] {
  const clean = options
    .map((o) => ({ text: o.text?.toString().trim() ?? "", isCorrect: !!o.isCorrect }))
    .filter((o) => o.text.length > 0);

  if (!usesOptions(type)) {
    if (clean.length) throw new Error("Este tipo de exercício não usa gabarito de opções.");
    return [];
  }
  if (clean.length === 0) return []; // sem gabarito ainda
  if (clean.length < 2) throw new Error("São necessárias pelo menos 2 opções.");
  if (clean.filter((o) => o.isCorrect).length !== 1) {
    throw new Error("Marque exatamente 1 opção correta.");
  }
  return clean;
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

  const options = normalizeOptions(input.type, input.options);

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
      options: options.length
        ? { create: options.map((o, i) => ({ text: o.text, isCorrect: o.isCorrect, order: i, organizationId })) }
        : undefined,
    },
  });
}

/**
 * Substitui o gabarito de um exercício (delete + recreate). Escopo owner+org.
 * NOTA: como Answer.selectedOptionId é SET NULL ao apagar a opção, editar o
 * gabarito depois de existirem submissões anula a escolha desses alunos —
 * o fluxo esperado é definir o gabarito ANTES de o exame ser feito.
 */
export async function setExerciseOptions(exerciseId: string, options: ExerciseOptionInput[]) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, organizationId, ownerId: teacherId },
    select: { id: true, type: true },
  });
  if (!exercise) throw new Error("Exercício inválido ou sem permissão.");

  const clean = normalizeOptions(exercise.type, options);

  await prisma.$transaction([
    prisma.exerciseOption.deleteMany({ where: { exerciseId } }),
    ...(clean.length
      ? [
          prisma.exerciseOption.createMany({
            data: clean.map((o, i) => ({ exerciseId, text: o.text, isCorrect: o.isCorrect, order: i, organizationId })),
          }),
        ]
      : []),
  ]);

  return { count: clean.length };
}

export async function getMyExercises() {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.exercise.findMany({
    where: { organizationId, ownerId: teacherId },
    include: {
      topic: { select: { name: true } },
      options: { orderBy: { order: "asc" }, select: { id: true, text: true, isCorrect: true, order: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getExerciseById(id: string) {
  const organizationId = await getCurrentOrganizationId();
  return prisma.exercise.findFirst({
    where: { id, organizationId },
    include: {
      topic: { select: { name: true } },
      options: { orderBy: { order: "asc" }, select: { id: true, text: true, isCorrect: true, order: true } },
    },
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
