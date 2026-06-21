import { withMiddlewareAuthRequired, getSession } from "@auth0/nextjs-auth0/edge";
import { NextResponse } from "next/server";

export default withMiddlewareAuthRequired(async (req) => {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  const session = await getSession(req, res);
  if (!session?.user) return res;

  const onboarded = session.user.onboarded;
  const role = session.user.role;

  // Autenticado mas sem onboarding concluído → força a tela de onboarding.
  if (onboarded === false && !pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // Já concluiu o onboarding e tenta acessar /onboarding → vai para a sua área.
  if (onboarded === true && pathname.startsWith("/onboarding")) {
    const home = role === "student" ? "/student" : "/dashboard";
    return NextResponse.redirect(new URL(home, req.url));
  }

  // Roteamento por persona: cada role só na sua área (a autorização real é por action).
  if (onboarded === true) {
    if (role === "student" && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/student", req.url));
    }
    if (role !== "student" && pathname.startsWith("/student")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return res;
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile", "/student/:path*", "/onboarding"],
};
