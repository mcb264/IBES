import { createHash, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { Pool } from "pg";
import { promisify } from "util";

export const SESSION_COOKIE = "ibes_session";
const SESSION_DAYS = 90;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const scryptAsync = promisify(scrypt);
let pool: Pool | undefined;

export function db() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL manquante");
  pool ??= new Pool({ connectionString, max: 1 });
  return pool;
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function newSession() {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  return { token, tokenHash: hashToken(token), expiresAt };
}

export function isValidLogin(value: unknown): value is string {
  return typeof value === "string" && value.trim().length >= 3 && value.trim().length <= 64;
}

export function isValidPassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash) return false;

  const [algorithm, salt, encodedHash] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !encodedHash) return false;

  const expected = Buffer.from(encodedHash, "base64url");
  const actual = (await scryptAsync(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function hasSetupSecret(value: unknown) {
  const expected = process.env.IBES_SETUP_SECRET;
  if (typeof value !== "string" || !expected) return false;

  const actualBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function setSessionCookie(response: Response, session: ReturnType<typeof newSession>) {
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${session.token}; Path=/; HttpOnly; SameSite=Lax; Expires=${session.expiresAt.toUTCString()}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
}

export async function currentUserId() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const pool = db();
  const result = await pool.query(
    `SELECT user_id FROM ibes_sessions WHERE token_hash = $1 AND expires_at > now()`,
    [hashToken(token)],
  );
  return (result.rows[0]?.user_id as string | undefined) ?? null;
}
