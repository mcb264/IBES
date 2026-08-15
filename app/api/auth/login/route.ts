import { NextRequest, NextResponse } from "next/server";
import { db, isValidLogin, isValidPassword, newSession, setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const login = body?.login;
  const password = body?.password;
  if (!isValidLogin(login) || !isValidPassword(password)) {
    return NextResponse.json({ error: "Identifiant ou mot de passe invalide" }, { status: 400 });
  }

  const pool = db();
  const result = await pool.query("SELECT id, password_hash FROM ibes_users WHERE lower(login) = lower($1)", [login.trim()]);
  const user = result.rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Identifiant ou mot de passe incorrect" }, { status: 401 });
  }

  const session = newSession();
  await pool.query("DELETE FROM ibes_sessions WHERE expires_at <= now()");
  await pool.query(
    "INSERT INTO ibes_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [session.tokenHash, user.id, session.expiresAt],
  );

  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, session);
  return response;
}
