import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { Pool } from "pg";

export const SESSION_COOKIE = "ibes_session";
const SESSION_DAYS = 90;

export function db() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL manquante");
  return new Pool({ connectionString, max: 1 });
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function makePasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function newSession() {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  return { token, tokenHash: hashToken(token), expiresAt };
}

export async function currentUserId() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const pool = db();
  try {
    const result = await pool.query(
      `SELECT user_id FROM ibes_sessions WHERE token_hash = $1 AND expires_at > now()`,
      [hashToken(token)],
    );
    return (result.rows[0]?.user_id as string | undefined) ?? null;
  } finally {
    await pool.end();
  }
}
