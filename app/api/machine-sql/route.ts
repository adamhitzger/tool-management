import { ToolHistoryPayload } from "@/types";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { pool } from "@/database/client";

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const body: ToolHistoryPayload = await req.json();
    console.log(body);

    const { tool_id, start, end, obrobek_id, korekce, type, machine_id } = body;

    if (!tool_id || !start || !obrobek_id || !korekce || !type) {
      return NextResponse.json({ error: "Neplatná data" }, { status: 400 });
    }

    await client.query("BEGIN");

    // 1️⃣ Upsert do tabulky tools
    await client.query(
      `
        INSERT INTO tools (id, type, is_ok, first_usage, machine_id)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `,
      [tool_id, type, 1, start, machine_id ?? null]
    );

    // 2️⃣ Ověříme, jestli obrobek existuje, pokud ne, uložíme ho
    const existing = await client.query(
      `SELECT id FROM obrobky WHERE obrobek_id = $1`,
      [obrobek_id]
    );

    if (existing.rowCount === 0) {
      await client.query(
        `INSERT INTO obrobky (obrobek_id) VALUES ($1)`,
        [obrobek_id]
      );
    }

    // 3️⃣ Pak vložíme záznam o výměně do tools_history
    await client.query(
      `
        INSERT INTO tools_history (tool_id, start, "end", obrobek_id, korekce)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [tool_id, start, end ?? null, obrobek_id, korekce]
    );

    await client.query("COMMIT");

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("API Route /machine-sql error: ", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}
