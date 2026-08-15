import { NextRequest, NextResponse } from "next/server";
import {
  db,
  hasSetupSecret,
  hashPassword,
  isValidLogin,
  isValidPassword,
  newSession,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const mode = body?.mode;
  const currentLogin = body?.currentLogin;
  const login = body?.login;
  const password = body?.password;
  const setupSecret = body?.setupSecret;

  if ((mode !== "existing" && mode !== "new") || !isValidLogin(login) || !isValidPassword(password)) {
    return NextResponse.json({ error: "Les informations fournies sont invalides" }, { status: 400 });
  }
  if (mode === "existing" && !isValidLogin(currentLogin)) {
    return NextResponse.json({ error: "L'identifiant actuel est requis" }, { status: 400 });
  }
  if (!hasSetupSecret(setupSecret)) {
    return NextResponse.json({ error: "Code de première connexion incorrect" }, { status: 401 });
  }

  const pool = db();
  try {
    const passwordHash = await hashPassword(password);
    const result = mode === "existing"
      ? await pool.query(
          `UPDATE ibes_users
           SET login = $1, password_hash = $2
           WHERE lower(login) = lower($3) AND password_hash IS NULL
           RETURNING id`,
          [login.trim(), passwordHash, currentLogin.trim()],
        )
      : await pool.query(
          "INSERT INTO ibes_users (login, password_hash) VALUES ($1, $2) RETURNING id",
          [login.trim(), passwordHash],
        );
    const user = result.rows[0];
    if (!user) {
      return NextResponse.json({ error: "Compte introuvable ou déjà initialisé" }, { status: 409 });
    }

    await pool.query("DELETE FROM ibes_sessions WHERE user_id = $1", [user.id]);
    const session = newSession();
    await pool.query(
      "INSERT INTO ibes_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
      [session.tokenHash, user.id, session.expiresAt],
    );

    const response = NextResponse.json({ ok: true });
    setSessionCookie(response, session);
    return response;
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "Cet identifiant est déjà utilisé" }, { status: 409 });
    }
    throw error;
  }
}
