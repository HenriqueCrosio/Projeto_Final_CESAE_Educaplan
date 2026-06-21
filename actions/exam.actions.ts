"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId, getCurrentOrganizationId } from "@/lib/auth";
import type { ExamTypeEnum } from "@prisma/client";

export interface CreateExamInput {
  name: string;
  description?: string | null;
  type: ExamTypeEnum;
  moduleId: string;
  date: string | Date;
  duration: number; // minutos
  maxScore: number;
  // Exercícios na ordem desejada.
  exerciseIds?: string[];
}

// Substitui o conjunto de exercícios de um exame, preservando a ordem.
async function setExamExercises(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  examId: string,
  exerciseIds: string[],
  organizationId: string
) {
  await tx.examExercise.deleteMany({ where: { examId } });
  if (!exerciseIds.length) return;
  // Garante que todos os exercícios pertencem à organização.
  const valid = await tx.exercise.findMany({
    where: { id: { in: exerciseIds }, organizationId },
    select: { id: true },
  });
  const validSet = new Set(valid.map((e) => e.id));
  const rows = exerciseIds
    .filter((id) => validSet.has(id))
    .map((exerciseId, index) => ({ examId, exerciseId, order: index + 1 }));
  if (rows.length) await tx.examExercise.createMany({ data: rows });
}

export async function createExam(input: CreateExamInput) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  const name = input.name?.trim();
  if (!name) throw new Error("O nome do exame é obrigatório.");
  if (!input.moduleId) throw new Error("Selecione o módulo do exame.");
  const date = new Date(input.date);
  if (isNaN(+date)) throw new Error("Data inválida.");

  // O módulo tem de pertencer ao professor + org.
  const moduleParent = await prisma.module.findFirst({
    where: { id: input.moduleId, organizationId, ownerId: teacherId },
    select: { id: true },
  });
  if (!moduleParent) throw new Error("Módulo inválido ou sem permissão.");

  return prisma.$transaction(async (tx) => {
    const exam = await tx.exam.create({
      data: {
        name,
        description: input.description?.toString().trim() || null,
        type: input.type,
        moduleId: input.moduleId,
        date,
        duration: Number(input.duration) || 0,
        maxScore: Number(input.maxScore) || 0,
        creatorId: teacherId,
        ownerId: teacherId,
        organizationId,
      },
    });
    await setExamExercises(tx, exam.id, input.exerciseIds || [], organizationId);
    return exam;
  });
}

export async function getMyExams() {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.exam.findMany({
    where: { organizationId, ownerId: teacherId },
    include: {
      module: { select: { name: true } },
      _count: { select: { exercises: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function getExamById(id: string) {
  const organizationId = await getCurrentOrganizationId();
  return prisma.exam.findFirst({
    where: { id, organizationId },
    include: {
      module: { select: { name: true } },
      exercises: {
        orderBy: { order: "asc" },
        include: { exercise: { select: { id: true, title: true, points: true, type: true } } },
      },
    },
  });
}

export async function updateExam(
  id: string,
  data: Partial<Omit<CreateExamInput, "type" | "moduleId">> & { type?: ExamTypeEnum }
) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  const owned = await prisma.exam.findFirst({
    where: { id, organizationId, ownerId: teacherId },
    select: { id: true },
  });
  if (!owned) throw new Error("Exame inválido ou sem permissão.");

  return prisma.$transaction(async (tx) => {
    await tx.exam.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.toString().trim() || null } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.date !== undefined ? { date: new Date(data.date) } : {}),
        ...(data.duration !== undefined ? { duration: Number(data.duration) || 0 } : {}),
        ...(data.maxScore !== undefined ? { maxScore: Number(data.maxScore) || 0 } : {}),
      },
    });
    if (data.exerciseIds !== undefined) {
      await setExamExercises(tx, id, data.exerciseIds, organizationId);
    }
    return { count: 1 };
  });
}

export async function deleteExam(id: string) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  const owned = await prisma.exam.findFirst({
    where: { id, organizationId, ownerId: teacherId },
    select: { id: true },
  });
  if (!owned) return { count: 0 };
  await prisma.examExercise.deleteMany({ where: { examId: id } });
  await prisma.exam.delete({ where: { id } });
  return { count: 1 };
}
