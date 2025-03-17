'server-only';

import { getSession } from "@auth0/nextjs-auth0";

// Helper function to get the logged-in teacher's ID
export async function getCurrentTeacherId() {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: No teacher ID found in session.");
  }

  return session.user.id;
}
