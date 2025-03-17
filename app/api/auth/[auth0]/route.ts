import { handleAuth, handleCallback, handleLogin } from "@auth0/nextjs-auth0";
import { getUserWithRole } from "@/actions/user.actions";
import { type AfterCallbackAppRoute } from "@auth0/nextjs-auth0";

const afterCallback: AfterCallbackAppRoute = async (_req, session) => {
  if (session.user?.email) {
    const userWithRole = await getUserWithRole(session.user.email);

    if (userWithRole) {
      session.user.role = userWithRole.role;

      if (userWithRole.role === "teacher") {
        session.user.id = userWithRole.teacher?.id;
      } else if (userWithRole.role === "student") {
        session.user.id = userWithRole.student?.id;
      }
    }
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
