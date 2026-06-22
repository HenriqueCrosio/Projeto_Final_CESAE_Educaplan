"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentStudentId } from "@/lib/auth";

/**
 * Leituras read-only da ÁREA DO ALUNO (S2).
 *
 * Autorização: o aluno não tem org_id na sessão (Student é global). Toda a
 * filtragem deriva da pertença à turma — `Class.students.some({ id: studentId })`.
 * Um aluno só vê turmas onde foi colocado e, a partir delas, a agenda/exames/
 * materiais do curso dessa turma. Não há escrita neste módulo.
 */

/** Turmas onde o aluno logado está colocado (com curso + professor). */
export async function getMyClasses() {
  const studentId = await getCurrentStudentId();

  return prisma.class.findMany({
    where: { students: { some: { id: studentId } } },
    select: {
      id: true,
      name: true,
      color: true,
      course: { select: { id: true, name: true, category: true } },
      teacher: {
        select: { user: { select: { profile: { select: { displayName: true } }, email: true } } },
      },
      _count: { select: { students: true, schedules: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Detalhe de UMA turma do aluno: agenda (aulas marcadas), exames e materiais
 * do curso da turma. Devolve null se o aluno não pertencer à turma (sem acesso).
 */
export async function getMyClassDetail(classId: string) {
  const studentId = await getCurrentStudentId();

  // Porta de autorização: a turma tem de conter este aluno.
  const klass = await prisma.class.findFirst({
    where: { id: classId, students: { some: { id: studentId } } },
    select: {
      id: true,
      name: true,
      color: true,
      course: {
        select: {
          id: true,
          name: true,
          category: true,
          modules: { select: { id: true, name: true, topics: { select: { id: true } } } },
        },
      },
      teacher: {
        select: { user: { select: { profile: { select: { displayName: true } }, email: true } } },
      },
    },
  });
  if (!klass) return null;

  const moduleIds = klass.course.modules.map((m) => m.id);
  const topicIds = klass.course.modules.flatMap((m) => m.topics.map((t) => t.id));

  // Agenda: aulas marcadas para ESTA turma.
  const schedules = await prisma.lessonSchedule.findMany({
    where: { classId: klass.id },
    select: {
      id: true,
      dateTime: true,
      duration: true,
      lesson: {
        select: { id: true, name: true, module: { select: { id: true, name: true } } },
      },
    },
    orderBy: { dateTime: "asc" },
  });

  // Exames dos módulos do curso da turma (+ a submissão deste aluno, se houver).
  const exams = moduleIds.length
    ? await prisma.exam.findMany({
        where: { moduleId: { in: moduleIds } },
        select: {
          id: true,
          name: true,
          type: true,
          date: true,
          duration: true,
          maxScore: true,
          module: { select: { id: true, name: true } },
          submissions: {
            where: { studentId },
            select: { status: true, score: true },
            take: 1,
          },
        },
        orderBy: { date: "asc" },
      })
    : [];

  // Materiais anexados ao curso, aos seus módulos ou tópicos.
  const materials = await prisma.material.findMany({
    where: {
      OR: [
        { courseId: klass.course.id },
        ...(moduleIds.length ? [{ moduleId: { in: moduleIds } }] : []),
        ...(topicIds.length ? [{ topicId: { in: topicIds } }] : []),
      ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      url: true,
      type: true,
      module: { select: { name: true } },
      topic: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return { class: klass, schedules, exams, materials };
}
