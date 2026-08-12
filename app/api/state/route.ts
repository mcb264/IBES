import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

function db() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL manquante");
  return new Pool({ connectionString, max: 1 });
}

export async function GET() {
  const pool = db();
  try {
    const result = await pool.query("SELECT data, updated_at FROM ibes_state WHERE id = $1", ["main"]);
    return NextResponse.json(result.rows[0] ?? { data: {}, updated_at: null });
  } finally {
    await pool.end();
  }
}

export async function PUT(request: NextRequest) {
  const payload = await request.json();
  const pool = db();
  try {
    const result = await pool.query(
      `INSERT INTO ibes_state (id, data, updated_at)
       VALUES ($1, $2::jsonb, now())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
       RETURNING updated_at`,
      ["main", JSON.stringify(payload)],
    );
    return NextResponse.json({ ok: true, updated_at: result.rows[0].updated_at });
  } finally {
    await pool.end();
  }
}
