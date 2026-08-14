import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, hashToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    const pool = db();
    try {
      await pool.query("DELETE FROM ibes_sessions WHERE token_hash = $1", [hashToken(token)]);
    } finally {
      await pool.end();
    }
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
