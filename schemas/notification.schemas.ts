import { z } from "zod";

// Notification Type Enum
export const NotificationTypeEnum = z.enum([
  "CREATED",
  "UPDATED",
  "DELETED",
  "CLASS_STARTED",
  "CLASS_ENDED",
  "ENROLLMENT",
  "OTHER",
]);

// Notification Schema
export const notificationSchema = z.object({
  id: z.string(),
  title: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  type: NotificationTypeEnum,
  teacherId: z.string().nullable().optional(),
  studentId: z.string().nullable().optional(),
  seen: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create Notification Schema
export const createNotificationSchema = notificationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update Notification Schema
export const updateNotificationSchema = notificationSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
});

// Export TypeScript Types
export type Notification = z.infer<typeof notificationSchema>;
export type CreateNotification = z.infer<typeof createNotificationSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;
