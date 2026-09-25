import React from "react"
import { pool } from "@/database/client"
import { getUser } from "@/database/session"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { DataTable } from "@/components/dashboard/data-table"
import Link from "next/link"

import { Wrench, Clock, Activity, TrendingUp } from "lucide-react"

interface ToolHistoryRow {
  id: number
  tool_id: number
  start: number
  end: number
  korekce: string | number
  obrobek_id: string | number
  first_usage: string
  // z JOIN tools
  usage_count: number
  type: string
}

interface ToolDetailPageProps {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic";

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { id } = await params

  const user = await getUser(await cookies())
  if (user == null) {
    redirect("/auth/sign-in")
  }

  // 1) Fetch history + tool info přes JOIN (stejně jako máš)
  const { rows } = await pool.query<ToolHistoryRow>(`
      SELECT 
      th.*, 
      t.type,
       t.first_usage
  FROM tools_history th
  JOIN tools t ON th.tool_id = t.id
  WHERE th.tool_id = $1
  ORDER BY th.start DESC
    `,
     [id])

  const history = rows as unknown as ToolHistoryRow[]
  // 2) Když neexistuje nástroj 
  const toolType = history[0]?.type ?? "Neznámý"
  const firstUsage = new Date(Number(history[0]?.first_usage)*1000).toLocaleDateString("cs-CZ")
  // 3) Statistika z historie
  const totalSeconds = history.reduce(
    (acc, row) => acc + (Number(row.end) - Number(row.start)),
    0
  )

  const avgMinutes =
    history.length > 0 ? Math.floor(totalSeconds / history.length / 60) : 0

  const totalHours = Math.floor(totalSeconds / 3600)

  // 4) Columns pro DataTable
  const columns = [
    {
      key: "start",
      header: "Začátek obrábění",
      render: (row: ToolHistoryRow) => (
        <span className="text-sm">
          {new Date(Number(row.start) * 1000).toLocaleString("cs-CZ")}
        </span>
      ),
    },
    {
      key: "end",
      header: "Konec obrábění",
      render: (row: ToolHistoryRow) => (
        <span className="text-sm">
          {new Date(Number(row.end) * 1000).toLocaleString("cs-CZ")}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Čas užití",
      render: (row: ToolHistoryRow) => {
        const minutes = Math.floor(
          (Number(row.end) - Number(row.start)) / 60
        )
        return <span className="font-medium">{minutes} min</span>
      },
    },
    {
      key: "korekce",
      header: "Korekce",
      render: (row: ToolHistoryRow) => {
        const value = Number(row.korekce)
        const cls =
          value === 0
            ? "text-muted-foreground"
            : value > 0
              ? "text-success"
              : "text-warning"

        return (
          <span className={cls}>
            {value > 0 ? "+" : ""}
            {String(row.korekce)}
          </span>
        )
      },
    },
    {
      key: "obrobek_id",
      header: "ID obrobku",
      render: (row: ToolHistoryRow) => (
        <Link
          href={`/obrobky/${encodeURIComponent(String(row.obrobek_id))}`}
          className="relative z-20 font-mono text-sm text-primary hover:underline"
        >
          {String(row.obrobek_id)}
        </Link>
      ),
    },
  ] as const

  return (
    <>
      <PageHeader
        title={`Nástroj #${id}`}
        description={`Detail a historie nástroje typu ${toolType}`}
        backHref="/tools"
      />

      {/* Tool Info Card */}
     

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="První použití"
          value={firstUsage}
          subtitle="Operací"
          icon={Activity}
          variant="default"
        />
        <StatCard
          title="Průměrný čas"
          value={`${avgMinutes} min`}
          subtitle="Na operaci"
          icon={Clock}
          variant="success"
        />
        <StatCard
          title="Celkový čas"
          value={`${totalHours} hod`}
          subtitle="V provozu"
          icon={TrendingUp}
          variant="default"
        />
        <StatCard
          title="Záznamů historie"
          value={history.length}
          subtitle="Užití"
          icon={Wrench}
          variant="warning"
        />
      </div>

      {/* History Table */}
      <DataTable<ToolHistoryRow>
        title="Historie obrábění"
        description="Záznamy o využití nástroje"
        columns={columns as any}
        data={history}
        emptyMessage="Žádná historie k zobrazení"
      />
    </>
  )
}
