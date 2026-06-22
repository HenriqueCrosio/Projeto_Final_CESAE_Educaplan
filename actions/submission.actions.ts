"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentStudentId } from "@/lib/auth";

/**
 * ESCRITA da ÁREA DO ALUNO (S3b) — fazer um exame + auto-correção.
 *
 * Autorização: o aluno não tem org_id. O acesso a um exame deriva de pertencer
 * a uma turma cujo curso contém o módulo do exame:
 *   exam.module.course.classes.some(students.some({ id: studentId }))
 *
 * SEGURANÇA: ao entregar o exame para responder NUNCA se envia `isCorrect` das
 * opções — o gabarito fica no servidor. A correção é feita aqui, no submit.
 */

type AnswerInput = {
  exerciseId: string;
  selectedOptionId?: string | null;
  responseText?: string | null;
};

const isAutoType = (type: string) => type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE";

/**
 * Carrega um exame para o aluno responder (opções SEM gabarito) + a submissão
 * existente, se já o fez. Devolve null se o aluno não tiver acesso.
 */
export async function getExamForTaking(examId: string) {
  const studentId = await getCurrentStudentId();

  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      module: { course: { classes: { some: { students: { some: { id: studentId } } } } } },
    },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      date: true,
      duration: true,
      maxScore: true,
      module: { select: { id: true, name: true, course: { select: { id: true, name: true } } } },
      exercises: {
        orderBy: { order: "asc" },
        select: {
          order: true,
          exercise: {
            select: {
              id: true,
              title: true,
              description: true,
              content: true,
              type: true,
              points: true,
              // NB: sem isCorrect — o gabarito não sai do servidor.
              options: { orderBy: { order: "asc" }, select: { id: true, text: true, order: true } },
            },
          },
        },
      },
    },
  });
  if (!exam) return null;

  const submission = await prisma.examSubmission.findUnique({
    where: { examId_studentId: { examId, studentId } },
    select: {
      id: true,
      status: true,
      score: true,
      submittedAt: true,
      gradedAt: true,
      answers: {
        select: {
          exerciseId: true,
          selectedOptionId: true,
          responseText: true,
          isCorrect: true,
          pointsAwarded: true,
          feedback: true,
        },
      },
    },
  });

  const totalPoints = exam.exercises.reduce((sum, ee) => sum + ee.exercise.points, 0);

  return { exam, submission, totalPoints };
}

/**
 * Submete as respostas do aluno (1 tentativa). Auto-corrige MC/TF comparando a
 * opção escolhida com o gabarito; perguntas de texto/código ficam por corrigir.
 * Se houver alguma pergunta manual → status SUBMITTED (aguarda professor); se
 * tudo for auto-corrigível → GRADED com score = Σ pontos obtidos.
 */
export async function submitExam(examId: string, answers: AnswerInput[]) {
  const studentId = await getCurrentStudentId();

  // Re-autoriza e carrega o gabarito (COM isCorrect, só no servidor).
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      module: { course: { classes: { some: { students: { some: { id: studentId } } } } } },
    },
    select: {
      id: true,
      name: true,
      ownerId: true,
      organizationId: true,
      module: { select: { id: true } },
      exercises: {
        select: {
          exercise: {
            select: {
              id: true,
              type: true,
              points: true,
              options: { select: { id: true, isCorrect: true } },
            },
          },
        },
      },
    },
  });
  if (!exam) throw new Error("Exame inválido ou sem acesso.");

  // 1 tentativa por aluno por exame.
  const existing = await prisma.examSubmission.findUnique({
    where: { examId_studentId: { examId, studentId } },
    select: { id: true },
  });
  if (existing) throw new Error("Já submeteu este exame.");

  // Turma do aluno neste curso (contexto da submissão).
  const klass = await prisma.class.findFirst({
    where: { course: { modules: { some: { id: exam.module.id } } }, students: { some: { id: studentId } } },
    select: { id: true },
  });

  const byExercise = new Map(answers.map((a) => [a.exerciseId, a]));

  let hasManual = false;
  let autoScore = 0;

  const answerData = exam.exercises.map(({ exercise }) => {
    const submitted = byExercise.get(exercise.id);

    if (isAutoType(exercise.type)) {
      const validIds = new Set(exercise.options.map((o) => o.id));
      const selectedOptionId =
        submitted?.selectedOptionId && validIds.has(submitted.selectedOptionId)
          ? submitted.selectedOptionId
          : null;
      const correct = exercise.options.find((o) => o.isCorrect);

      // Sem gabarito definido → não dá para auto-corrigir → vai para manual.
      if (!correct) {
        hasManual = true;
        return { exerciseId: exercise.id, selectedOptionId, responseText: null, isCorrect: null, pointsAwarded: null };
      }

      const isCorrect = selectedOptionId === correct.id;
      const pointsAwarded = isCorrect ? exercise.points : 0;
      if (isCorrect) autoScore += exercise.points;
      return { exerciseId: exercise.id, selectedOptionId, responseText: null, isCorrect, pointsAwarded };
    }

    // Texto/código/ficheiro → correção manual.
    hasManual = true;
    return {
      exerciseId: exercise.id,
      selectedOptionId: null,
      responseText: submitted?.responseText?.toString().trim() || null,
      isCorrect: null,
      pointsAwarded: null,
    };
  });

  const status = hasManual ? "SUBMITTED" : "GRADED";

  const submission = await prisma.examSubmission.create({
    data: {
      examId,
      studentId,
      classId: klass?.id ?? null,
      status,
      score: hasManual ? null : autoScore,
      submittedAt: new Date(),
      gradedAt: hasManual ? null : new Date(),
      organizationId: exam.organizationId,
      answers: { create: answerData },
    },
    select: { id: true, status: true, score: true },
  });

  // Notifica o professor dono do exame (best-effort — não falha a submissão).
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { studentId: true, user: { select: { email: true, profile: { select: { displayName: true } } } } },
    });
    const who = student?.user.profile?.displayName || student?.user.email || student?.studentId || "Um aluno";
    await prisma.notification.create({
      data: {
        type: "OTHER",
        title: "Nova submissão de exame",
        message: `${who} submeteu "${exam.name}".`,
        teacherId: exam.ownerId,
        organizationId: exam.organizationId,
        seen: false,
      },
    });
  } catch {
    // Ignora falhas de notificação — não devem impedir o registo da submissão.
  }

  return submission;
}
