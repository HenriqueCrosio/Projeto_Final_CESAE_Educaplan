
import { prisma } from "@/lib/prisma";
import { getCurrentTeacherId } from "@/lib/auth";
import { createCourseSchema, updateCourseSchema, Course, UpdateCourse } from "@/schemas/course.schemas";

// Create a course (Automatically assigns `teacherId`)
export async function createCourse(data: Omit<Course, "ownerId">) {
  const teacherId = await getCurrentTeacherId();
  const validatedData = createCourseSchema.parse({ ...data, ownerId: teacherId });

  return await prisma.course.create({ data: validatedData });
}

// Update a course (Ensures teacher can only modify their own course)
export async function updateCourse(id: string, data: UpdateCourse) {
  const teacherId = await getCurrentTeacherId();
  const validatedData = updateCourseSchema.parse(data);

  return await prisma.course.updateMany({
    where: { id, creatorId: teacherId, ownerId: teacherId }, // Ensures teacher is updating only their courses
    data: validatedData,
  });
}

// Delete a course (Ensures teacher can only delete their own course)
export async function deleteCourse(id: string) {
  const teacherId = await getCurrentTeacherId();

  return await prisma.course.deleteMany({
    where: { id, ownerId: teacherId },
  });
}
