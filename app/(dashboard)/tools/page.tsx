import React from "react"
import { pool } from "@/database/client"
import { getUser } from "@/database/session"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/dashboard/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"

interface Tool {
  id: number
  type: string
  first_usage: number
  usage_count: number
  is_ok: number
  history_count: number
  name: string
}

const columns: {
  key: string
  header: string
  render: (row: Tool) => React.ReactNode
}[] = [
  {
    key: "id",
    header: "ID Nástroje",
    render: (row: Tool) => (
      <span className="font-mono text-primary">#{row.id}</span>
    ),
  },
  {
    key: "type",
    header: "Typ nástroje",
    render: (row: Tool) => (
      <Badge variant="secondary" className="font-normal">
        {String(row.type)}
      </Badge>
    ),
  },
  {
    key: "first_usage",
    header: "První použití",
    render: (row: Tool) => (
      <span className="text-sm">
        {new Date(Number(row.first_usage) * 1000).toLocaleDateString("cs-CZ")}
      </span>
    ),
  },
  {
    key: "history_count",
    header: "Počet použití",
    render: (row: Tool) => (
      <span className="font-medium">{Number(row.history_count)}×</span>
    ),
  },
  {
    key: "name",
    header: "Stroj",
    render: (row: Tool) => (
      <span className="font-medium">{String(row.name)}</span>
    ),
  },
  {
      key: "is_ok",
      header: "NOK",
      render: (row: Tool) => (
        <span className="text-center font-medium">{Number(row.is_ok) === 1 ? "Ne" : "Ano"}</span>
      ),
  },
]


export default async function ToolsPage() {
  const user = await getUser(await cookies())
  if (user == null) {
    redirect("/auth/sign-in")
  }
  const { rows } = await pool.query<Tool>(
     `
    SELECT 
    t.id,
    t.type,
    t.is_ok,
    t.first_usage,
    t.machine_id,
    m.name AS name,
    COALESCE(th_counts.history_count, 0) AS history_count
FROM tools t
LEFT JOIN (
    SELECT tool_id, COUNT(*) AS history_count
    FROM tools_history
    GROUP BY tool_id
) th_counts
    ON th_counts.tool_id = t.id
LEFT JOIN machines m
    ON m.id = t.machine_id
ORDER BY t.id DESC;
    `
  )

  const tools = rows as unknown as Tool[]
  return (
    <>
      <PageHeader
        title="Nástroje"
        description="Správa a přehled všech CNC nástrojů"
        actions={
          <>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </>
        }
      />

      <DataTable<Tool>
        columns={columns}
        data={tools}
        linkPrefix="/tools"
        linkKey="id"
        emptyMessage="Zatím nemáte žádné nástroje"
      />
    </>
  )
}
