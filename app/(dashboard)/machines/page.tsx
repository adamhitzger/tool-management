import { PageHeader } from "@/components/dashboard/page-header"
import { pool } from "@/database/client"
import { getUser } from "@/database/session"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Machine, MachinesGrid } from "@/components/dashboard/machines-grid"
import { AddMachineDialog } from "@/components/forms/add-machine"

export const dynamic = "force-dynamic";

export default async function Machines(){
    const user = await getUser(await cookies())
      if (user == null) {
        redirect("/auth/sign-in")
      }
      const {rows} = await pool.query<Machine>(`
        SELECT * FROM machines WHERE organization_id = $1  
      `
      ,[user.organization_id]
      )
      console.log(rows)
      
      const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
  
      return(
        <>
          <PageHeader
            title="Stroje"
            description="Přehled CNC strojů"
            actions={
         isAdmin &&<>
            <AddMachineDialog orgId={user.organization_id}/>   
          </>
        }
          />
          <MachinesGrid machines={rows} isAdmin={isAdmin}/>
        </>
    )
}