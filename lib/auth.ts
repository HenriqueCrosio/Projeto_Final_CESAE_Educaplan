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

// Helper function to get the current organization (tenant) ID from the session.
// O provisioning (Fase 2) popula `session.user.org_id` no afterCallback.
export async function getCurrentOrganizationId(): Promise<string> {
  const session = await getSession();

  const organizationId = session?.user?.org_id;
  if (!organizationId) {
    throw new Error("Unauthorized: No organization found in session.");
  }

  return organizationId as string;
}
