'server-only';

import { cache } from "react";
import { getSession } from "@auth0/nextjs-auth0";
import { prisma } from "@/lib/prisma";

/**
 * AUTORIZAÇÃO CENTRALIZADA (Fase 4).
 *
 * Fonte de verdade única e tipada para a identidade autenticada. As actions
 * deixam de ler claims soltos da sessão e passam por aqui.
 *
 * Modelo de confiança (decisão 2026-06-22): re-verificação na BD. Os claims da
 * sessão (assinados pelo Auth0) dão a IDENTIDADE; a AUTORIZAÇÃO (pertença ativa
 * à organização / existência do aluno) é confirmada contra a BD a cada pedido —
 * fecha a janela de "privilégio obsoleto" (claim válido após remoção/despromoção).
 *
 * Custo: `cache()` do React deduplica por request, logo é 1 query por pedido
 * (não por chamada), mesmo que getCurrentTeacherId + getCurrentOrganizationId
 * sejam chamados na mesma action.
 */

export type AppRole = "teacher" | "student" | "admin" | "user";

/** Forma tipada dos claims que o afterCallback grava em session.user. */
interface AppSessionUser {
  id?: string;
  role?: AppRole;
  org_id?: string;
  onboarded?: boolean;
}

export interface SessionContext {
  /** id da entidade da sessão: Teacher.id / Student.id / Admin.id / User.id. */
  entityId: string;
  role: AppRole;
  orgId: string | null;
  onboarded: boolean;
}

/** Contexto base da sessão (só identidade, sem garantir role). Deduplicado por request. */
export const getSessionContext = cache(async (): Promise<SessionContext> => {
  const session = await getSession();
  const user = session?.user as AppSessionUser | undefined;

  if (!user?.id) {
    throw new Error("Unauthorized: No authenticated session.");
  }

  return {
    entityId: user.id,
    role: user.role ?? "user",
    orgId: user.org_id ?? null,
    onboarded: !!user.onboarded,
  };
});

const TEACHER_ROLES = ["OWNER", "ADMIN", "TEACHER"] as const;

/**
 * Exige um professor com pertença ATIVA à sua organização (verificado na BD).
 * Deduplicado por request. Devolve teacherId + orgId + papel na org.
 */
export const requireTeacher = cache(async () => {
  const ctx = await getSessionContext();
  if (ctx.role !== "teacher") {
    throw new Error("Unauthorized: requires a teacher account.");
  }
  if (!ctx.orgId) {
    throw new Error("Unauthorized: no organization in session.");
  }

  // Re-verificação na BD: este professor pertence a esta org com papel docente.
  const membership = await prisma.membership.findFirst({
    where: {
      organizationId: ctx.orgId,
      role: { in: [...TEACHER_ROLES] },
      user: { teacher: { id: ctx.entityId } },
    },
    select: { role: true },
  });
  if (!membership) {
    throw new Error("Unauthorized: not an active member of the organization.");
  }

  return { teacherId: ctx.entityId, orgId: ctx.orgId, membershipRole: membership.role };
});

/**
 * Exige um aluno cujo registo Student ainda existe (verificado na BD). O aluno
 * é global (sem org); o escopo real das leituras é por pertença à turma, feito
 * nas próprias queries. Deduplicado por request.
 */
export const requireStudent = cache(async () => {
  const ctx = await getSessionContext();
  if (ctx.role !== "student") {
    throw new Error("Unauthorized: requires a student account.");
  }
  const student = await prisma.student.findUnique({
    where: { id: ctx.entityId },
    select: { id: true },
  });
  if (!student) {
    throw new Error("Unauthorized: student record not found.");
  }
  return { studentId: ctx.entityId };
});

// ── Wrappers retrocompatíveis (mantêm os call sites das actions intactos) ──

/** Teacher.id do professor autenticado (com pertença ativa à org verificada). */
export async function getCurrentTeacherId(): Promise<string> {
  return (await requireTeacher()).teacherId;
}

/** organizationId do professor autenticado (verificado na BD). */
export async function getCurrentOrganizationId(): Promise<string> {
  return (await requireTeacher()).orgId;
}

/** Student.id do aluno autenticado (registo verificado na BD). */
export async function getCurrentStudentId(): Promise<string> {
  return (await requireStudent()).studentId;
}
