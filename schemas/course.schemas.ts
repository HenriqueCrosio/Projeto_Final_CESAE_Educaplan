import { z } from "zod";

export enum CourseStatusEnum {
    DRAFT = "DRAFT",
    COMPLETED = "COMPLETED",
    ARCHIVED = "ARCHIVED",
  }
  
  export enum PublishStatusEnum {
    PRIVATE = "PRIVATE",
    PUBLISHED_FOR_SALE = "PUBLISHED_FOR_SALE",
    PUBLISHED_FOR_RENT = "PUBLISHED_FOR_RENT",
    PUBLISHED_FOR_BOTH = "PUBLISHED_FOR_BOTH",
  }

  export const courseSchema = z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    category: z.string(),
    status: z.nativeEnum(CourseStatusEnum),
    createdAt: z.date(),
    updatedAt: z.date(),
    creatorId: z.string(),
    ownerId: z.string(),
    publishStatus: z.nativeEnum(PublishStatusEnum),
  })

// Schema for creating a Course
export const createCourseSchema = z.object({
  slug: z.string().min(3).max(100),
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  category: z.string().min(3),
  status: z.nativeEnum(CourseStatusEnum).default(CourseStatusEnum.DRAFT),
  creatorId: z.string(),
  ownerId: z.string(),
  publishStatus: z.nativeEnum(PublishStatusEnum).default(PublishStatusEnum.PRIVATE),
});

// Schema for updating a Course
export const updateCourseSchema = createCourseSchema.partial();

// Infer TypeScript types from Zod schemas
export type Course = z.infer<typeof courseSchema>;
export type CreateCourse = z.infer<typeof createCourseSchema>;
export type UpdateCourse = z.infer<typeof updateCourseSchema>;
