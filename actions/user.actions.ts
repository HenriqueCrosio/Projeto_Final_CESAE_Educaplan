
import { prisma } from "@/lib/prisma";
import {
  createUserSchema,
  updateUserSchema,
  createProfileSchema,
  updateProfileSchema,
  createTeacherSchema,
  updateTeacherSchema,
  createStudentSchema,
  updateStudentSchema,
  createAdminSchema,
  updateAdminSchema,
  type User,
  type Profile,
  type Teacher,
  type Student,
  type Admin,
} from "@/schemas/user.schemas";

// Create a new user
export async function createUser(data: User) {
  const validatedData = createUserSchema.parse(data);
  return await prisma.user.create({ data: validatedData });
}

// Update user details
export async function updateUser(id: string, data: Partial<User>) {
  const validatedData = updateUserSchema.parse(data);
  return await prisma.user.update({ where: { id }, data: validatedData });
}

// Delete a user
export async function deleteUser(id: string) {
  return await prisma.user.delete({ where: { id } });
}

// Get user by ID
export async function getUserById(id: string) {
  return await prisma.user.findUnique({ where: { id } });
}

// Get user by email
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({ where: { email } });
}

// Create and update Profiles, Teachers, Students, Admins
export async function createProfile(data: Profile) {
  const validatedData = createProfileSchema.parse(data);
  return await prisma.profile.create({ data: validatedData });
}

export async function updateProfile(id: string, data: Partial<Profile>) {
  const validatedData = updateProfileSchema.parse(data);
  return await prisma.profile.update({ where: { id }, data: validatedData });
}

export async function createTeacher(data: Teacher) {
  const validatedData = createTeacherSchema.parse(data);
  return await prisma.teacher.create({ data: validatedData });
}

export async function updateTeacher(id: string, data: Partial<Teacher>) {
  const validatedData = updateTeacherSchema.parse(data);
  return await prisma.teacher.update({ where: { id }, data: validatedData });
}

export async function createStudent(data: Student) {
  const validatedData = createStudentSchema.parse(data);
  return await prisma.student.create({ data: validatedData });
}

export async function updateStudent(id: string, data: Partial<Student>) {
  const validatedData = updateStudentSchema.parse(data);
  return await prisma.student.update({ where: { id }, data: validatedData });
}

export async function createAdmin(data: Admin) {
  const validatedData = createAdminSchema.parse(data);
  return await prisma.admin.create({ data: validatedData });
}

export async function updateAdmin(id: string, data: Partial<Admin>) {
  const validatedData = updateAdminSchema.parse(data);
  return await prisma.admin.update({ where: { id }, data: validatedData });
}

// Get user with their role
export async function getUserWithRole(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      teacher: true,
      student: true,
      admin: true,
    },
  });

  if (!user) return null;
  if (user.teacher) return { ...user, role: "teacher" };
  if (user.student) return { ...user, role: "student" };
  if (user.admin) return { ...user, role: "admin" };

  return { ...user, role: "user" };
}

