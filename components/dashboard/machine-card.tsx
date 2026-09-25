"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Power, Zap, X } from "lucide-react"
import { Machine } from "./machines-grid"
import { deleteMachine } from "@/database/actions"
import { toast } from "sonner"

export function MachineCard({ machine, isAdmin }: { machine: Machine , isAdmin: boolean}) {
  const isRunning = machine.is_running === 1

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      {/* Status accent bar */}
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          isRunning ? "bg-success" : "bg-muted-foreground/30"
        }`}
      />

      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isRunning
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">
                {machine.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {"ID: "}
                {machine.id}
              </p>
            </div>
          </div>
          {isAdmin &&
          <div className="flex flex-row space-x-2">
              
              <Button variant={"destructive"} onClick={async () => {
                const del = await deleteMachine(machine.id);
                if(del.success){
                  toast.success("Stroj byl odebrán")
                }else{
                  toast.error("Nepodařilo se odebrat stroj")
                }
              }}  className="h-6 w-6">
                <X className="text-white h-6 w-6"/>
              </Button>
          </div>
          
          }
        </div>

        {/* CNC Machine Visual */}
        <div className="mt-4">
          <CNCVisualization isRunning={isRunning} />
        </div>

        {/* Status footer */}
        <div className="mt-4 flex items-center justify-between">
          <Badge
            variant="outline"
            className={`gap-1.5 ${
              isRunning
                ? "border-success/30 bg-success/10 text-success"
                : "border-muted-foreground/20 bg-muted text-muted-foreground"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isRunning ? "animate-pulse bg-success" : "bg-muted-foreground"
              }`}
            />
            {isRunning ? "V provozu" : "Vypnuto"}
          </Badge>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {isRunning ? "Aktivni" : "Neaktivni"}
            </span>
            <span className="flex items-center gap-1">
              <Power className="h-3 w-3" />
              {isRunning ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CNCVisualization({ isRunning }: { isRunning: boolean }) {
  return (
    <div
      className={`relative rounded-lg border p-4 ${
        isRunning
          ? "border-success/20 bg-success/5"
          : "border-border bg-muted/50"
      }`}
    >
      <svg
        viewBox="0 0 280 120"
        className="w-full"
        aria-label={isRunning ? "CNC stroj v provozu" : "CNC stroj vypnuty"}
      >
        {/* Machine base / bed */}
        <rect
          x="20"
          y="85"
          width="240"
          height="20"
          rx="3"
          className={
            isRunning ? "fill-success/20 stroke-success/40" : "fill-muted stroke-border"
          }
          strokeWidth="1.5"
        />

        {/* Bed rails */}
        <line
          x1="30"
          y1="90"
          x2="250"
          y2="90"
          className={isRunning ? "stroke-success/30" : "stroke-border"}
          strokeWidth="1"
          strokeDasharray="4 3"
        />
        <line
          x1="30"
          y1="98"
          x2="250"
          y2="98"
          className={isRunning ? "stroke-success/30" : "stroke-border"}
          strokeWidth="1"
          strokeDasharray="4 3"
        />

        {/* Left vertical column */}
        <rect
          x="30"
          y="20"
          width="18"
          height="65"
          rx="2"
          className={
            isRunning ? "fill-success/15 stroke-success/40" : "fill-muted stroke-border"
          }
          strokeWidth="1.5"
        />

        {/* Right vertical column */}
        <rect
          x="232"
          y="20"
          width="18"
          height="65"
          rx="2"
          className={
            isRunning ? "fill-success/15 stroke-success/40" : "fill-muted stroke-border"
          }
          strokeWidth="1.5"
        />

        {/* Top crossbeam / gantry */}
        <rect
          x="30"
          y="18"
          width="220"
          height="14"
          rx="2"
          className={
            isRunning ? "fill-success/20 stroke-success/40" : "fill-muted stroke-border"
          }
          strokeWidth="1.5"
        />

        {/* Spindle carriage */}
        <rect
          x="115"
          y="32"
          width="50"
          height="16"
          rx="2"
          className={
            isRunning ? "fill-success/30 stroke-success/50" : "fill-muted stroke-border"
          }
          strokeWidth="1.5"
        >
          {isRunning && (
            <animate
              attributeName="x"
              values="90;170;90"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </rect>

        {/* Spindle / tool */}
        <line
          x1="140"
          y1="48"
          x2="140"
          y2="72"
          className={isRunning ? "stroke-success" : "stroke-muted-foreground/40"}
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          {isRunning && (
            <animate
              attributeName="x1"
              values="115;195;115"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
          {isRunning && (
            <animate
              attributeName="x2"
              values="115;195;115"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </line>

        {/* Drill bit tip */}
        <circle
          cx="140"
          cy="74"
          r="3"
          className={
            isRunning ? "fill-success" : "fill-muted-foreground/30"
          }
        >
          {isRunning && (
            <>
              <animate
                attributeName="cx"
                values="115;195;115"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values="3;4;3"
                dur="0.3s"
                repeatCount="indefinite"
              />
            </>
          )}
        </circle>

        {/* Workpiece on bed */}
        <rect
          x="80"
          y="75"
          width="120"
          height="10"
          rx="1"
          className={
            isRunning ? "fill-primary/20 stroke-primary/30" : "fill-muted/80 stroke-border"
          }
          strokeWidth="1"
        />

        {/* Status indicator light */}
        <circle
          cx="25"
          cy="14"
          r="4"
          className={isRunning ? "fill-success" : "fill-muted-foreground/30"}
        >
          {isRunning && (
            <animate
              attributeName="opacity"
              values="1;0.4;1"
              dur="1.5s"
              repeatCount="indefinite"
            />
          )}
        </circle>

        {/* Spark particles when running */}
        {isRunning && (
          <>
            <circle cx="118" cy="70" r="1" className="fill-warning">
              <animate
                attributeName="cx"
                values="115;195;115"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values="70;66;70"
                dur="0.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="0.4s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="122" cy="68" r="0.8" className="fill-warning">
              <animate
                attributeName="cx"
                values="119;199;119"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values="68;63;68"
                dur="0.35s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1;0;1"
                dur="0.3s"
                repeatCount="indefinite"
              />
            </circle>
          </>
        )}
      </svg>
    </div>
  )
}
