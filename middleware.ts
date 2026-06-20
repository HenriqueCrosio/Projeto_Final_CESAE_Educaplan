import { withMiddlewareAuthRequired, getSession } from "@auth0/nextjs-auth0/edge";
import { NextResponse } from "next/server";

export default withMiddlewareAuthRequired(async (req) => {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  const session = await getSession(req, res);
  const onboarded = session?.user?.onboarded;

  // Autenticado mas sem onboarding concluído → força a tela de onboarding.
  if (session?.user && onboarded === false && !pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // Já concluiu o onboarding e tenta acessar /onboarding → volta ao dashboard.
  if (session?.user && onboarded === true && pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
});

export const config = {
  matcher: ["/dashboard", "/admin", "/profile", "/student", "/onboarding"],
};
