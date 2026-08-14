import { NextRequest, NextResponse } from "next/server";
import { currentUserId, db } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const pool = db();
  try {
    const result = await pool.query(
      "SELECT data, updated_at FROM ibes_state WHERE user_id = $1 AND id = $2",
      [userId, "main"],
    );
    return NextResponse.json(result.rows[0] ?? { data: {}, updated_at: null });
  } finally {
    await pool.end();
  }
}

export async function PUT(request: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const payload = await request.json();
  const pool = db();
  try {
    const result = await pool.query(
      `INSERT INTO ibes_state (user_id, id, data, updated_at)
       VALUES ($1, $2, $3::jsonb, now())
       ON CONFLICT (user_id, id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
       RETURNING updated_at`,
      [userId, "main", JSON.stringify(payload)],
    );
    return NextResponse.json({ ok: true, updated_at: result.rows[0].updated_at });
  } finally {
    await pool.end();
  }
}
