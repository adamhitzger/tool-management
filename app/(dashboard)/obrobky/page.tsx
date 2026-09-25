import React from "react"
import { pool } from "@/database/client"
import { getUser } from "@/database/session"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/dashboard/page-header"
import { DataTable } from "@/components/dashboard/data-table"

export const dynamic = "force-dynamic";

interface ObrobekRow {
  id: number
  obrobek_id: string
  tools_count: number
  operations_count: number
  last_start: number | null
}

const columns: {
  key: string
  header: string
  render: (row: ObrobekRow) => React.ReactNode
}[] = [
  {
    key: "id",
    header: "ID",
    render: (row: ObrobekRow) => (
      <span className="font-mono text-muted-foreground">#{row.id}</span>
    ),
  },
  {
    key: "obrobek_id",
    header: "ID obrobku",
    render: (row: ObrobekRow) => (
      <span className="font-mono text-primary">{row.obrobek_id}</span>
    ),
  },
  {
    key: "tools_count",
    header: "Nástrojů",
    render: (row: ObrobekRow) => (
      <span className="font-medium">{Number(row.tools_count)}</span>
    ),
  },
  {
    key: "operations_count",
    header: "Operací",
    render: (row: ObrobekRow) => (
      <span className="font-medium">{Number(row.operations_count)}×</span>
    ),
  },
  {
    key: "last_start",
    header: "Poslední obrábění",
    render: (row: ObrobekRow) => (
      <span className="text-sm">
        {row.last_start
          ? new Date(Number(row.last_start) * 1000).toLocaleString("cs-CZ")
          : "-"}
      </span>
    ),
  },
]

export default async function ObrobkyPage() {
  const user = await getUser(await cookies())
  if (user == null) {
    redirect("/auth/sign-in")
  }

  const { rows } = await pool.query<ObrobekRow>(`
    SELECT
      o.id,
      o.obrobek_id,
      COUNT(DISTINCT th.tool_id) AS tools_count,
      COUNT(th.id) AS operations_count,
      MAX(th.start) AS last_start
    FROM obrobky o
    LEFT JOIN tools_history th ON th.obrobek_id = o.obrobek_id
    GROUP BY o.id, o.obrobek_id
    ORDER BY o.id DESC;
  `)

  return (
    <>
      <PageHeader
        title="Obrobky"
        description="Přehled obrobků a nástrojů, kterými byly obrobeny"
      />

      <DataTable<ObrobekRow>
        columns={columns}
        data={rows}
        linkPrefix="/obrobky"
        linkKey="obrobek_id"
        emptyMessage="Zatím nemáte žádné obrobky"
      />
    </>
  )
}
