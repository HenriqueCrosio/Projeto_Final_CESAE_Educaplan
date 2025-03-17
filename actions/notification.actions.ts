
import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId } from "@/lib/auth";
import {
  createNotificationSchema,
  CreateNotification,
} from "@/schemas/notification.schemas";

// Get Unseen Notifications
export async function getUnseenNotifications() {
  const teacherId = await getCurrentTeacherId();

  return await prisma.notification.findMany({
    where: {
      teacherId: teacherId,
      seen: false,
    },
    orderBy: { createdAt: "desc" },
  });
}

// Mark Notifications as Seen
export async function markNotificationsAsSeen() {
  const teacherId = await getCurrentTeacherId();

  return await prisma.notification.updateMany({
    where: { teacherId: teacherId, seen: false },
    data: { seen: true },
  });
}

// Create a Notification
export async function createNotification(data: Omit<CreateNotification, "teacherId">) {
  const teacherId = await getCurrentTeacherId();
  const validatedData = createNotificationSchema.parse({ ...data, teacherId });

  return await prisma.notification.create({ data: validatedData });
}

// Delete a Notification (Ensures only the owner can delete)
export async function deleteNotification(id: string) {
  const teacherId = await getCurrentTeacherId();

  return await prisma.notification.deleteMany({
    where: { id, teacherId },
  });
}
