import { ToolHistoryPayload } from "@/types";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { pool } from "@/database/client";

export async function POST(req: NextRequest) {
  try {
    const body: ToolHistoryPayload = await req.json();
    console.log(body);

    const { tool_id, start, end, obrobek_id, korekce, organization_id, type, machine_id } = body;

    if (!tool_id || !start || !obrobek_id || !korekce || !organization_id || !type) {
      return NextResponse.json({ error: "Neplatná data" }, { status: 400 });
    }
    // 1️⃣ Upsert do tabulky tools
    await pool.query(
      `
        INSERT INTO tools (id, type, is_ok, first_usage, organization_id, machine_id)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO NOTHING
      `,
      [tool_id, type, 1, start, organization_id, machine_id]
    );

    // 2️⃣ Pak vložíme do tools_history
    await pool.query(
      `
        INSERT INTO tools_history (tool_id, start, end, obrobek_id, korekce, organization_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [tool_id, start, end, obrobek_id, korekce, organization_id]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("API Route /machine-sql error: ", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
