import React from "react"
import { pool } from "@/database/client"
import { getUser } from "@/database/session"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"

import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { DataTable } from "@/components/dashboard/data-table"
import { Badge } from "@/components/ui/badge"

import { Wrench, Clock, Activity, Hash } from "lucide-react"

interface ObrobekToolRow {
  id: number
  tool_id: string
  type: string
  machine_name: string | null
  start: number
  end: number | null
  korekce: string | number
}

interface ObrobekDetailPageProps {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic";

export default async function ObrobekDetailPage({ params }: ObrobekDetailPageProps) {
  const { id } = await params
  const obrobekId = decodeURIComponent(id)

  const user = await getUser(await cookies())
  if (user == null) {
    redirect("/auth/sign-in")
  }

  const obrobek = await pool.query<{ id: number; obrobek_id: string }>(
    `SELECT id, obrobek_id FROM obrobky WHERE obrobek_id = $1`,
    [obrobekId]
  )

  if (obrobek.rowCount === 0) {
    notFound()
  }

  // Nástroje, kterými byl obrobek obroben (jeden řádek = jedna operace)
  const { rows } = await pool.query<ObrobekToolRow>(
    `
    SELECT
      th.id,
      th.tool_id,
      th.start,
      th."end",
      th.korekce,
      t.type,
      m.name AS machine_name
    FROM tools_history th
    JOIN tools t ON t.id = th.tool_id
    LEFT JOIN machines m ON m.id = t.machine_id
    WHERE th.obrobek_id = $1
    ORDER BY th.start ASC
    `,
    [obrobekId]
  )

  const history = rows

  const uniqueTools = new Set(history.map((r) => r.tool_id)).size

  const totalSeconds = history.reduce(
    (acc, r) => acc + (r.end ? Number(r.end) - Number(r.start) : 0),
    0
  )
  const totalMinutes = Math.floor(totalSeconds / 60)

  const columns: {
    key: string
    header: string
    render: (row: ObrobekToolRow) => React.ReactNode
  }[] = [
    {
      key: "tool_id",
      header: "Nástroj",
      render: (row: ObrobekToolRow) => (
        <Link
          href={`/tools/${row.tool_id}`}
          className="relative z-20 font-mono text-primary hover:underline"
        >
          #{row.tool_id}
        </Link>
      ),
    },
    {
      key: "type",
      header: "Typ",
      render: (row: ObrobekToolRow) => (
        <Badge variant="secondary" className="font-normal">
          {String(row.type)}
        </Badge>
      ),
    },
    {
      key: "machine_name",
      header: "Stroj",
      render: (row: ObrobekToolRow) => (
        <span className="text-sm">{row.machine_name ?? "-"}</span>
      ),
    },
    {
      key: "start",
      header: "Začátek obrábění",
      render: (row: ObrobekToolRow) => (
        <span className="text-sm">
          {new Date(Number(row.start) * 1000).toLocaleString("cs-CZ")}
        </span>
      ),
    },
    {
      key: "end",
      header: "Konec obrábění",
      render: (row: ObrobekToolRow) => (
        <span className="text-sm">
          {row.end
            ? new Date(Number(row.end) * 1000).toLocaleString("cs-CZ")
            : "-"}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Čas užití",
      render: (row: ObrobekToolRow) => {
        if (!row.end) return <span className="text-muted-foreground">-</span>
        const minutes = Math.floor((Number(row.end) - Number(row.start)) / 60)
        return <span className="font-medium">{minutes} min</span>
      },
    },
    {
      key: "korekce",
      header: "Korekce",
      render: (row: ObrobekToolRow) => {
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
  ]

  return (
    <>
      <PageHeader
        title={`Obrobek ${obrobekId}`}
        description="Nástroje, kterými byl obrobek obroben"
        backHref="/obrobky"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="ID v databázi"
          value={`#${obrobek.rows[0].id}`}
          subtitle="Interní ID"
          icon={Hash}
          variant="default"
        />
        <StatCard
          title="Použitých nástrojů"
          value={uniqueTools}
          subtitle="Unikátních"
          icon={Wrench}
          variant="success"
        />
        <StatCard
          title="Operací"
          value={history.length}
          subtitle="Záznamů historie"
          icon={Activity}
          variant="default"
        />
        <StatCard
          title="Celkový čas"
          value={`${totalMinutes} min`}
          subtitle="Obrábění"
          icon={Clock}
          variant="warning"
        />
      </div>

      <DataTable<ObrobekToolRow>
        title="Historie obrábění"
        description="Nástroje a operace provedené na tomto obrobku"
        columns={columns}
        data={history}
        emptyMessage="Tento obrobek zatím nebyl obroben žádným nástrojem"
      />
    </>
  )
}
