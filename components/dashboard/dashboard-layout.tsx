import React from "react"
import { DashboardSidebar } from "./sidebar"
import { getUserFromSession } from "@/database/session"
import { cookies } from "next/headers"
import { pool } from "@/database/client"
interface DashboardLayoutProps {
  children: React.ReactNode
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  const userId = await getUserFromSession(await cookies());
  
  const getCompany = await pool.query(
    "SELECT organizations.* FROM users JOIN organizations ON users.organization_id = organizations.id WHERE users.id = $1;",
    [userId]
  )
 const data = getCompany.rows[0];
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar name={data.name as string} icon={String(data.icon_name)}/>
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}