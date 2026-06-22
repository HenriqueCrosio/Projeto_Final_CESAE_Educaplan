"use server";

import { prisma } from "@/lib/prisma";
import { getSessionContext, getCurrentTeacherId, getCurrentOrganizationId } from "@/lib/auth";
import {
  createNotificationSchema,
  CreateNotification,
} from "@/schemas/notification.schemas";

// O sino renderiza para qualquer sessão; estas leituras devolvem [] (sem lançar)
// quando o utilizador não é professor, evitando ruído de "Unauthorized" no log.
async function teacherIdOrNull(): Promise<string | null> {
  try {
    const ctx = await getSessionContext();
    if (ctx.role !== "teacher") return null;
  } catch {
    return null; // sem sessão
  }
  return getCurrentTeacherId();
}

// Notificações não vistas do professor autenticado.
export async function getUnseenNotifications() {
  const teacherId = await teacherIdOrNull();
  if (!teacherId) return [];

  return await prisma.notification.findMany({
    where: { teacherId, seen: false },
    orderBy: { createdAt: "desc" },
  });
}

// Notificações recentes (vistas ou não) — alimenta o painel "Atividade Recente".
export async function getRecentNotifications(limit = 10) {
  const teacherId = await teacherIdOrNull();
  if (!teacherId) return [];

  return await prisma.notification.findMany({
    where: { teacherId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// Marca todas as não vistas como vistas.
export async function markNotificationsAsSeen() {
  const teacherId = await teacherIdOrNull();
  if (!teacherId) return { count: 0 };

  return await prisma.notification.updateMany({
    where: { teacherId, seen: false },
    data: { seen: true },
  });
}

// Cria uma notificação para o próprio professor (uso administrativo/manual).
export async function createNotification(data: Omit<CreateNotification, "teacherId">) {
  const teacherId = await getCurrentTeacherId();
  const organizationId = await getCurrentOrganizationId();
  const validatedData = createNotificationSchema.parse({ ...data, teacherId });

  return await prisma.notification.create({ data: { ...validatedData, organizationId } });
}

// Apaga uma notificação (só o dono).
export async function deleteNotification(id: string) {
  const teacherId = await getCurrentTeacherId();

  return await prisma.notification.deleteMany({
    where: { id, teacherId },
  });
}
