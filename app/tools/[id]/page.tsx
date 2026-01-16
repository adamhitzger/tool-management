import { turso } from "@/database/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getUser } from "@/database/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ToolsPage({params}: {params: Promise<{id: number}>}){
        const search = await params
        const user = await getUser(await cookies());
          if(user == null){ 
              redirect("/auth/sign-in");
          }

        const {rows} = await turso.execute({
            sql:"SELECT th.*, t.usage_count, t.type FROM tools_history th JOIN tools t ON th.tool_id = t.id WHERE th.organization_id = ? AND th.tool_id = ?;",
            args: [user.organization_id, search.id]
          });
          console.log(rows)
    return(
        <div className="p-4 min-h-screen w-full flex flex-col items-center justify-center">
          <div className='flex items-center flex-col space-y-4'>
            <h1>Houfek Tool management Dashboard</h1>
            <h2>Tool ID: {search.id}</h2>
             <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center w-[100px]">Typ nástroje</TableHead>
          <TableHead className="text-center ">Začátek obrábění</TableHead>
          <TableHead>Konec obrábění</TableHead>
          <TableHead >Čas užití</TableHead>
          <TableHead >Korekce</TableHead>
          <TableHead >ID obrobku</TableHead>
           <TableHead >Použití</TableHead>

        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={Number(row.id)}>
            <TableCell className="text-center font-medium">{String(row.type)}</TableCell>
            <TableCell className="text-center font-medium">{new Date(Number(row.start)*1000).toLocaleTimeString()}</TableCell>
            <TableCell className="text-center font-medium">{new Date(Number(row.end)*1000).toLocaleTimeString()}</TableCell>
            <TableCell className="text-center font-medium">{Math.floor((Number(row.end) - Number(row.start)) / 60)} min</TableCell>
            <TableCell className="text-center font-medium">{String(row.korekce)}</TableCell>
            <TableCell className="text-center font-medium">{String(row.obrobek_id)}</TableCell>
            <TableCell className="text-center font-medium">{String(row.usage_count)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
            </Table>
        </div>
    </div>
    )
}