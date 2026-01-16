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

export default async function ToolsPage(){
          const user = await getUser(await cookies());
          if(user == null){ 
              redirect("/auth/sign-in");
          }
          const {rows} = await turso.execute({
            sql:"SELECT * FROM tools WHERE organization_id = ?",
            args: [user.organization_id]
          });
          console.log(rows)
    return(
        <div className="p-4 min-h-screen w-full flex flex-col items-center justify-center">
          <div className='flex flex-col space-y-4'>
            <h1 className='text-center'>Houfek Tool management Dashboard</h1>
            <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center w-[100px]">Nástroj</TableHead>
          <TableHead className="text-center w-[100px]">Typ nástroje</TableHead>
          <TableHead className="text-center ">První použití</TableHead>
           <TableHead >Počet použití</TableHead>

        </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row) => (
                <TableRow key={Number(row.id)}>
                        <TableCell className="text-center font-medium">
                            <Link href={"/tools/"+Number(row.id)}>{Number(row.id)}</Link>
                        </TableCell>
                        <TableCell className="text-center font-medium">{String(row.type)}</TableCell>
                        <TableCell className="text-center font-medium">{new Date(Number(row.first_usage)*1000).toLocaleString("cs-CZ")}</TableCell>
                        <TableCell className="text-center font-medium">{String(row.usage_count)}</TableCell>      
                    </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
    </div>
    )
}