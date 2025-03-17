import { cache } from "react";
import { getUserById, getUserByEmail, getUserWithRole } from "@/actions/user.actions";

// Get user by ID (cached)
export const getCachedUserById = cache(async (id: string) => {
  return await getUserById(id);
});

// Get user by email (cached)
export const getCachedUserByEmail = cache(async (email: string) => {
  return await getUserByEmail(email);
});

// Get user with role (cached)
export const getCachedUserWithRole = cache(async (email: string) => {
  return await getUserWithRole(email);
});


import { UserWithTeacherV2, userWithTeacherSchemaV2 } from "@/schemas/user.schemas"
import { prisma } from "@/lib/prisma";

export async function getTeacherByEmailV2(email: string): Promise<UserWithTeacherV2 | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          teacher: true,
        },
      })
  
        if (!user) {
            throw new Error("User not found")
        }
  
      return userWithTeacherSchemaV2.parse(user)
    } catch (error) {
      console.error("Error fetching user by email:", error)
      throw new Error("Failed to fetch user")
    }
}