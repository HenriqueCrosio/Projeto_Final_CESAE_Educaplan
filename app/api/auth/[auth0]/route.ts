import { handleAuth, handleCallback, handleLogin } from "@auth0/nextjs-auth0";
import { getUserWithRole } from "@/actions/user.actions";
import { provisionPendingUser } from "@/actions/organization.actions";
import { type AfterCallbackAppRoute } from "@auth0/nextjs-auth0";

const afterCallback: AfterCallbackAppRoute = async (_req, session) => {
  if (session.user?.email) {
    const userWithRole = await getUserWithRole(session.user.email);

    // 1º login (email novo): cria conta PENDENTE (User+Profile). A persona
    // (professor vs aluno) é escolhida no /onboarding.
    if (!userWithRole) {
      const user = await provisionPendingUser(session.user.email, session.user.name);
      session.user.id = user.id;
      session.user.role = "user";
      session.user.onboarded = false; // → middleware envia para /onboarding
      return session;
    }

    // Usuário existente: hidrata a sessão a partir do banco (claiming por email).
    session.user.role = userWithRole.role;
    const membership = userWithRole.memberships?.[0];

    if (userWithRole.role === "teacher") {
      session.user.id = userWithRole.teacher?.id;
      session.user.org_id = membership?.organizationId;
      session.user.onboarded = membership?.organization?.onboarded ?? false;
    } else if (userWithRole.role === "student") {
      session.user.id = userWithRole.student?.id;
      session.user.org_id = membership?.organizationId; // pode não ter (sem turma ainda)
      session.user.onboarded = true; // já tem registo Student
    } else if (userWithRole.role === "admin") {
      session.user.id = userWithRole.admin?.id;
      session.user.org_id = membership?.organizationId;
      session.user.onboarded = true;
    } else {
      // role "user": conta pendente que ainda não escolheu persona.
      session.user.id = userWithRole.id;
      session.user.onboarded = false;
    }
  }

  return session;
};

// Expose Auth0 handlers
export const GET = handleAuth({
  callback: handleCallback({ afterCallback }),
  login: handleLogin({
    returnTo: "/dashboard",
    authorizationParams: { max_age: 0, screen_hint: "signup" },
  }),
  signup: handleLogin({
    returnTo: "/dashboard",
    authorizationParams: { screen_hint: "signup" },
  }),
});
