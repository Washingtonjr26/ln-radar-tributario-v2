import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_SENHA = process.env.ADMIN_SENHA;

    if (email !== ADMIN_EMAIL || senha !== ADMIN_SENHA) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set("ln_admin_auth", "autenticado", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 horas
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("ln_admin_auth");
  return response;
}
