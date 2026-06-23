"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId, getCurrentOrganizationId } from "@/lib/auth";
import { awardActivity, gradedBonus, hasActivityForRef } from "@/lib/gamification";

/**
 * CORREÇÃO (lado do professor, S3c). Escopo por organizationId — as submissões
 * herdam o org do exame. O professor vê o gabarito (isCorrect das opções),
 * corrige as perguntas manuais (texto/código/ficheiro) e finaliza → GRADED.
 */

const studentName = (s: { user: { email: string; profile: { displayName: string | null } | null } }) =>
  s.user.profile?.displayName || s.user.email;

/** Lista de submissões da organização (para a fila de correção). */
export async function getSubmissionsForGrading() {
  const organizationId = await getCurrentOrganizationId();
  const rows = await prisma.examSubmission.findMany({
    where: { organizationId },
    select: {
      id: true,
      status: true,
      score: true,
      submittedAt: true,
      gradedAt: true,
      exam: { select: { id: true, name: true } },
      student: { select: { studentId: true, user: { select: { email: true, profile: { select: { displayName: true } } } } } },
      _count: { select: { answers: true } },
    },
    orderBy: { submittedAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    score: r.score,
    submittedAt: r.submittedAt,
    gradedAt: r.gradedAt,
    exam: r.exam,
    studentName: studentName(r.student),
    studentNumber: r.student.studentId,
    answerCount: r._count.answers,
  }));
}

/** Detalhe de uma submissão para correção (com gabarito). null se sem acesso. */
export async function getSubmissionForGrading(submissionId: string) {
  const organizationId = await getCurrentOrganizationId();
  const submission = await prisma.examSubmission.findFirst({
    where: { id: submissionId, organizationId },
    select: {
      id: true,
      status: true,
      score: true,
      submittedAt: true,
      gradedAt: true,
      exam: { select: { id: true, name: true, maxScore: true } },
      student: { select: { studentId: true, user: { select: { email: true, profile: { select: { displayName: true } } } } } },
      answers: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          selectedOptionId: true,
          responseText: true,
          isCorrect: true,
          pointsAwarded: true,
          feedback: true,
          exercise: {
            select: {
              id: true,
              title: true,
              content: true,
              type: true,
              points: true,
              options: { orderBy: { order: "asc" }, select: { id: true, text: true, isCorrect: true } },
            },
          },
        },
      },
    },
  });
  if (!submission) return null;

  const totalPoints = submission.answers.reduce((sum, a) => sum + a.exercise.points, 0);
  return {
    ...submission,
    studentName: studentName(submission.student),
    studentNumber: submission.student.studentId,
    totalPoints,
  };
}

export interface GradeItemInput {
  answerId: string;
  pointsAwarded: number | null;
  isCorrect?: boolean | null;
  feedback?: string | null;
}

/**
 * Aplica as notas/feedback por resposta, recalcula o score (Σ pontos) e finaliza
 * a submissão como GRADED. Só atualiza respostas que pertencem à submissão.
 */
export async function gradeSubmission(submissionId: string, items: GradeItemInput[]) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();

  const submission = await prisma.examSubmission.findFirst({
    where: { id: submissionId, organizationId },
    select: {
      id: true,
      studentId: true,
      examId: true,
      answers: { select: { id: true, exercise: { select: { points: true } } } },
    },
  });
  if (!submission) throw new Error("Submissão inválida ou sem permissão.");

  const validIds = new Set(submission.answers.map((a) => a.id));
  const updates = items.filter((i) => validIds.has(i.answerId));

  await prisma.$transaction([
    ...updates.map((i) =>
      prisma.answer.update({
        where: { id: i.answerId },
        data: {
          pointsAwarded: i.pointsAwarded == null || Number.isNaN(Number(i.pointsAwarded)) ? null : Number(i.pointsAwarded),
          isCorrect: i.isCorrect ?? null,
          feedback: i.feedback?.toString().trim() || null,
        },
      })
    ),
  ]);

  // Recalcula o score a partir do estado final das respostas.
  const fresh = await prisma.answer.findMany({
    where: { examSubmissionId: submissionId },
    select: { pointsAwarded: true },
  });
  const score = fresh.reduce((s, a) => s + (a.pointsAwarded ?? 0), 0);

  await prisma.examSubmission.update({
    where: { id: submissionId },
    data: { status: "GRADED", score, gradedAt: new Date(), gradedById: teacherId },
  });

  // Gamificação (best-effort): premeia o aluno por exame avaliado, uma vez só.
  try {
    if (!(await hasActivityForRef(submission.studentId, "EXAM_GRADED", submission.examId))) {
      const totalPoints = submission.answers.reduce((s, a) => s + a.exercise.points, 0);
      const bonus = gradedBonus(totalPoints > 0 ? score / totalPoints : 0);
      await awardActivity(submission.studentId, "EXAM_GRADED", {
        refId: submission.examId,
        bonusXp: bonus.xp,
        bonusBooks: bonus.books,
      });
    }
  } catch {
    // Ganhos de gamificação nunca devem impedir a finalização da correção.
  }

  return { score };
}
