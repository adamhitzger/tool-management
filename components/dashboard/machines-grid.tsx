"use client"

import { MachineCard } from "@/components/dashboard/machine-card"

export interface Machine {
  id: number
  name: string
  is_running: number
  organization: number
}

export function MachinesGrid({ machines , isAdmin}: { machines: Machine[] , isAdmin: boolean}) {
  const runningCount = machines.filter((m) => m.is_running === 1).length
  const stoppedCount = machines.length - runningCount

  return (
    <div className="flex flex-col gap-6">
      {/* Stats row */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">
            {"V provozu: "}
            <span className="font-semibold text-foreground">{runningCount}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
          <span className="text-sm text-muted-foreground">
            {"Vypnuto: "}
            <span className="font-semibold text-foreground">{stoppedCount}</span>
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          {"Celkem: "}
          <span className="font-semibold text-foreground">{machines.length}</span>
        </div>
      </div>

      {/* Machine cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {machines.map((machine) => (
          <MachineCard key={machine.id} machine={machine} isAdmin={isAdmin}/>
        ))}
      </div>
    </div>
  )
}
