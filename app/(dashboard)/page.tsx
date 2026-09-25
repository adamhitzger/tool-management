import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getUser } from "@/database/session"
import { pool } from "@/database/client"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { DataTable } from "@/components/dashboard/data-table"

import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Wrench, Clock, Activity, AlertTriangle } from "lucide-react"

export const dynamic = "force-dynamic";

interface ToolHistoryRow {
  id: number
  tool_id: number
  type: string
  start: number
  end: number
  korekce: string | number
  obrobek_id: string | number
  usage_count: number
  is_ok: number
}

export default async function Home() {
  const user = await getUser(await cookies())
  if (user == null) {
    redirect("/auth/sign-in")
  }
  const { rows } = await pool.query<ToolHistoryRow>(
  `
    SELECT 
      th.*, 
      t.id AS tool_id, 
      t.type,
      t.first_usage,
      COUNT(th.tool_id) OVER (PARTITION BY th.tool_id) AS usage_count
    FROM tools_history th
    JOIN tools t ON t.id = th.tool_id
    ORDER BY th.start DESC;
  `
)
  const history = rows

  // --- Stats ---
  const totalTools = new Set(history.map((r) => r.tool_id)).size

  // "aktivní dnes" - jednoduchá varianta: záznamy v posledních 24h
  const now = Date.now() / 1000
  const activeToday = new Set(
    history
      .filter((r) => Number(r.start) >= now - 60 * 60 * 24)
      .map((r) => Number(r.tool_id))
  ).size

  const totalSeconds = history.reduce(
    (acc, r) => acc + (Number(r.end) - Number(r.start)),
    0
  )

  const avgTime =
    history.length > 0 ? Math.floor(totalSeconds / history.length / 60) : 0

  // "vyžaduje pozornost" - placeholder logika: korekce s velkou absolutní hodnotou
  const needsAttention = history.filter((r) => Math.abs(Number(r.korekce)) >= 0.03)
    .length

  // --- Columns for DataTable ---
  const columns = [
    {
      key: "tool_id",
      header: "Nástroj",
      render: (row: ToolHistoryRow) => (
        <span className="text-center font-mono text-primary">#{row.tool_id}</span>
      ),
    },
    {
      key: "type",
      header: "Typ",
      render: (row: ToolHistoryRow) => (
        <Badge variant="secondary" className="font-normal">
          {String(row.type)}
        </Badge>
      ),
    },
    {
      key: "start",
      header: "Začátek",
      render: (row: ToolHistoryRow) => (
        <span className="text-center text-sm">
          {new Date(Number(row.start) * 1000).toLocaleTimeString("cs-CZ")}
        </span>
      ),
    },
    {
      key: "end",
      header: "Konec",
      render: (row: ToolHistoryRow) => (
        <span className="text-center text-sm">
          {new Date(Number(row.end) * 1000).toLocaleTimeString("cs-CZ")}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Doba",
      render: (row: ToolHistoryRow) => {
        const minutes = Math.floor(
          (Number(row.end) - Number(row.start)) / 60
        )
        return <span className="text-center font-medium">{minutes} min</span>
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
      header: "Obrobek",
      render: (row: ToolHistoryRow) => (
        <Link
          href={`/obrobky/${encodeURIComponent(String(row.obrobek_id))}`}
          className="relative z-20 font-mono text-sm text-primary hover:underline"
        >
          {String(row.obrobek_id)}
        </Link>
      ),
    },
    {
      key: "usage_count",
      header: "Použití",
      render: (row: ToolHistoryRow) => (
        <span className="text-center font-medium">{Number(row.usage_count)}×</span>
      ),
    },
  ] as const

  return (
    <>
      <PageHeader
        title="Přehled"
        description="Sledujte využití a stav vašich CNC nástrojů"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Celkem nástrojů"
          value={totalTools}
          subtitle="Ve správě"
          icon={Wrench}
          variant="default"
        />
        <StatCard
          title="Aktivní dnes"
          value={activeToday}
          subtitle="Použitých nástrojů"
          icon={Activity}
          variant="success"
        />
        <StatCard
          title="Průměrný čas"
          value={`${avgTime} min`}
          subtitle="Na operaci"
          icon={Clock}
          variant="default"
        />
        <StatCard
          title="Vyžaduje pozornost"
          value={needsAttention}
          subtitle="Podezřelé korekce"
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      {/* Recent Activity Table */}
      <DataTable<ToolHistoryRow>
        title="Poslední aktivita"
        description="Přehled posledních operací s nástroji"
        columns={columns as any}
        data={history}
        linkPrefix="/tools"
        linkKey="tool_id"
        emptyMessage="Zatím nemáte žádné záznamy"
      />
    </>
  )
}
