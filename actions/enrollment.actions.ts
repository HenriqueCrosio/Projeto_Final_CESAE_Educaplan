"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId, getCurrentOrganizationId } from "@/lib/auth";
import type { CurrencyTypeEnum, EnrollmentStatusEnum } from "@prisma/client";

export interface CreateEnrollmentsInput {
  courseId: string;
  classIds: string[];
  startDate: string | Date;
  endDate: string | Date;
  // Preço por hora de cada módulo, em cêntimos. Módulos ausentes/0 não geram ModuleAssignment.
  modulePrices?: Record<string, number>;
  currency?: CurrencyTypeEnum;
  status?: EnrollmentStatusEnum;
}

/**
 * Cria matrículas no modelo NORMALIZADO: uma linha Enrollment por (curso × turma).
 * O preço de cada matrícula = Σ (hourlyRate do módulo × totalHours do módulo).
 * Também regista/atualiza os ModuleAssignment (preço por hora do módulo no curso, no período).
 */
export async function createEnrollments(input: CreateEnrollmentsInput) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  if (!input.courseId) throw new Error("Selecione o curso.");
  if (!input.classIds?.length) throw new Error("Selecione pelo menos uma turma.");
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  if (isNaN(+startDate) || isNaN(+endDate)) throw new Error("Datas inválidas.");
  if (endDate < startDate) throw new Error("A data final não pode ser anterior à inicial.");

  const currency: CurrencyTypeEnum = input.currency ?? "EUR";
  const status: EnrollmentStatusEnum = input.status ?? "PENDING";
  const modulePrices = input.modulePrices ?? {};

  // Curso tem de pertencer ao professor + org; traz os módulos para calcular o preço.
  const course = await prisma.course.findFirst({
    where: { id: input.courseId, organizationId, ownerId: teacherId },
    select: { id: true, modules: { select: { id: true, totalHours: true } } },
  });
  if (!course) throw new Error("Curso inválido ou sem permissão.");

  const validModuleIds = new Set(course.modules.map((m) => m.id));

  // Preço total por turma = Σ (preço/hora × horas do módulo).
  const perClassTotal = course.modules.reduce((sum, mod) => {
    const rate = modulePrices[mod.id] || 0;
    return sum + rate * (mod.totalHours || 0);
  }, 0);

  return prisma.$transaction(async (tx) => {
    // As turmas têm de pertencer a este curso + org + professor.
    const classes = await tx.class.findMany({
      where: { id: { in: input.classIds }, courseId: input.courseId, organizationId, teacherId },
      select: { id: true },
    });
    if (classes.length !== input.classIds.length) {
      throw new Error("Uma ou mais turmas são inválidas para este curso.");
    }

    // Uma matrícula por turma (idempotente via @@unique([courseId, classId])).
    const enrollments = [];
    for (const classId of input.classIds) {
      const enrollment = await tx.enrollment.upsert({
        where: { courseId_classId: { courseId: input.courseId, classId } },
        update: { startDate, endDate, totalPrice: perClassTotal, currency, status, teacherId },
        create: {
          courseId: input.courseId,
          classId,
          startDate,
          endDate,
          totalPrice: perClassTotal,
          currency,
          status,
          teacherId,
          organizationId,
        },
      });
      enrollments.push(enrollment);
    }

    // ModuleAssignment: preço/hora do módulo no curso, no período (idempotente via @@unique).
    for (const [moduleId, rate] of Object.entries(modulePrices)) {
      if (!rate || rate <= 0 || !validModuleIds.has(moduleId)) continue;
      await tx.moduleAssignment.upsert({
        where: {
          moduleId_teacherId_courseId_startDate_endDate: {
            moduleId,
            teacherId,
            courseId: input.courseId,
            startDate,
            endDate,
          },
        },
        update: { hourlyRate: rate, currency },
        create: {
          moduleId,
          teacherId,
          courseId: input.courseId,
          hourlyRate: rate,
          currency,
          startDate,
          endDate,
          organizationId,
        },
      });
    }

    return { count: enrollments.length, enrollments };
  });
}

export async function getMyEnrollments() {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  return prisma.enrollment.findMany({
    where: { organizationId, teacherId },
    include: {
      course: { select: { name: true } },
      class: { select: { name: true } },
    },
    orderBy: { startDate: "asc" },
  });
}

/** Detalhe read-only de uma matrícula: curso+módulos(+preços do período), turma, alunos. */
export async function getEnrollmentById(id: string) {
  const organizationId = await getCurrentOrganizationId();
  const enrollment = await prisma.enrollment.findFirst({
    where: { id, organizationId },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          modules: { select: { id: true, name: true, category: true, totalHours: true } },
        },
      },
      class: {
        select: {
          id: true,
          name: true,
          students: { include: { user: { include: { profile: true } } } },
        },
      },
    },
  });
  if (!enrollment) return null;

  // Preços por hora dos módulos para o período desta matrícula.
  const assignments = await prisma.moduleAssignment.findMany({
    where: {
      organizationId,
      courseId: enrollment.course.id,
      startDate: enrollment.startDate,
      endDate: enrollment.endDate,
    },
    select: { moduleId: true, hourlyRate: true, currency: true },
  });
  const priceByModule = Object.fromEntries(
    assignments.map((a) => [a.moduleId, { hourlyRate: a.hourlyRate, currency: a.currency }])
  );

  return { enrollment, priceByModule };
}

export async function deleteEnrollment(id: string) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  const owned = await prisma.enrollment.findFirst({
    where: { id, organizationId, teacherId },
    select: { id: true },
  });
  if (!owned) return { count: 0 };
  await prisma.enrollment.delete({ where: { id } });
  return { count: 1 };
}
