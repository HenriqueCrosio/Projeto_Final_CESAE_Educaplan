import { z } from "zod"

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  emailVerified: z.date().nullable(),
  userApiToken: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastAccessedAt: z.date().nullable(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
})

export const profileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  displayName: z.string().nullable(),
  bio: z.string().nullable(),
  birthDate: z.date().nullable(),
  phoneNumber: z.string().nullable(),
})

export const teacherSchema = z.object({
  id: z.string(),
  userId: z.string(),
  specialization: z.string().nullable(),
})

export const studentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  studentId: z.string(),
  enrollYear: z.number(),
  addedById: z.string(),
})

export const adminSchema = z.object({
  id: z.string(),
  userId: z.string(),
})

export type User = z.infer<typeof userSchema>
export type Profile = z.infer<typeof profileSchema>
export type Teacher = z.infer<typeof teacherSchema>
export type Student = z.infer<typeof studentSchema>
export type Admin = z.infer<typeof adminSchema>

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userApiToken: true,
  lastAccessedAt: true,
})

export const updateUserSchema = userSchema.partial().omit({ id: true })

export const createProfileSchema = profileSchema.omit({ id: true })
export const updateProfileSchema = profileSchema.partial().omit({ id: true, userId: true })

export const createTeacherSchema = teacherSchema.omit({ id: true })
export const updateTeacherSchema = teacherSchema.partial().omit({ id: true, userId: true })

export const createStudentSchema = studentSchema.omit({ id: true })
export const updateStudentSchema = studentSchema.partial().omit({ id: true, userId: true })

export const createAdminSchema = adminSchema.omit({ id: true })
export const updateAdminSchema = adminSchema.partial().omit({ id: true, userId: true })



export const userWithTeacherSchemaV2 = userSchema.extend({
  teacher: teacherSchema.nullable(),
})
export type UserWithTeacherV2 = z.infer<typeof userWithTeacherSchemaV2>
