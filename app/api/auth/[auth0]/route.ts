import { handleAuth, handleCallback, handleLogin } from "@auth0/nextjs-auth0";
import { getUserWithRole } from "@/actions/user.actions";
import { provisionNewUser } from "@/actions/organization.actions";
import { type AfterCallbackAppRoute } from "@auth0/nextjs-auth0";

const afterCallback: AfterCallbackAppRoute = async (_req, session) => {
  if (session.user?.email) {
    const userWithRole = await getUserWithRole(session.user.email);

    // Primeiro login: provisiona User + Organization + Membership(OWNER) + Profile + Teacher.
    if (!userWithRole) {
      const { teacher, organization } = await provisionNewUser(
        session.user.email,
        session.user.name
      );

      session.user.role = "teacher";
      session.user.id = teacher.id;
      session.user.org_id = organization.id;
      session.user.onboarded = organization.onboarded; // false → vai para o onboarding

      return session;
    }

    // Usuário existente: hidrata a sessão a partir do banco.
    session.user.role = userWithRole.role;

    if (userWithRole.role === "teacher") {
      session.user.id = userWithRole.teacher?.id;
    } else if (userWithRole.role === "student") {
      session.user.id = userWithRole.student?.id;
    } else if (userWithRole.role === "admin") {
      session.user.id = userWithRole.admin?.id;
    }

    const membership = userWithRole.memberships?.[0];
    session.user.org_id = membership?.organizationId;
    session.user.onboarded = membership?.organization?.onboarded ?? false;
  }

  return session;
};

// Expose Auth0 handlers
export const GET = handleAuth({
  callback: handleCallback({ afterCallback }),
  login: handleLogin({
    returnTo: "/dashboard",
    authorizationParams: { max_age: 0, screen_hint: 'signup' }
  }),
  signup: handleLogin({
    returnTo: "/dashboard",
    authorizationParams: {
      screen_hint: "signup",
    }
  })

});
