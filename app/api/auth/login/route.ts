import { NextRequest, NextResponse } from "next/server";
import { db, newSession, SESSION_COOKIE, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { login, password } = await request.json();
  if (typeof login !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 400 });
  }

  const pool = db();
  try {
    const result = await pool.query("SELECT id, password_hash FROM ibes_users WHERE login = $1", [login.trim()]);
    const user = result.rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: "Identifiant ou mot de passe incorrect" }, { status: 401 });
    }

    const session = newSession();
    await pool.query("DELETE FROM ibes_sessions WHERE expires_at <= now()");
    await pool.query(
      "INSERT INTO ibes_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
      [session.tokenHash, user.id, session.expiresAt],
    );

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: session.expiresAt,
    });
    return response;
  } finally {
    await pool.end();
  }
}
