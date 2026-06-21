import { NextRequest, NextResponse } from "next/server";

const ROTAS_PROTEGIDAS = ["/admin", "/crm"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protegida = ROTAS_PROTEGIDAS.some((rota) => pathname.startsWith(rota));

  if (protegida) {
    const cookie = req.cookies.get("ln_admin_auth");

    if (!cookie || cookie.value !== "autenticado") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/crm/:path*"],
};
