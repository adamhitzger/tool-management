import UserForm from "@/components/forms/user-form";
import { getUser } from "@/database/session"
import { cookies } from "next/headers"
import SignOutBtn from "@/components/forms/sign-out";
import { redirect } from "next/navigation";
import { turso } from "@/database/client";
import { ResultSet, Row } from "@libsql/client";
import AcceptRequest from "@/components/forms/accept";
import RejectRequest from "@/components/forms/reject";
import DeleteBtn from "@/components/forms/delete";

export default async function UserPage(){  
    const user = await getUser(await cookies());
    if(user == null){ 
        redirect("/auth/sign-in");
    }else{
    let requests: ResultSet | null = null;
    if(user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
        requests = await turso.execute({
            sql:"SELECT r.email, r.organization_id,o.name AS organization_name FROM requests r JOIN organizations o ON r.organization_id = o.id;",
        })
    }
    console.log(requests?.rows)
    return(
        <section className="flex flex-col space-y-3 p-8">
            <span>User:</span>
            <UserForm user={user}/> 
            <div className="max-w-60 flex flex-row justify-between">
        <SignOutBtn id={user.id}/>
        <DeleteBtn email={user.email} id={user.id}/>
            </div>
            

            
           {requests && requests.rows.length > 0 &&
           <>
            <h2>Pozvánky</h2>
            <div className="w-full flex flex-col">
                <div className="w-full items-center flex flex-row justify-between border-2 py-2 px-2 rounded-lg">
                    <div className="w-1/3 flex flex-row justify-between">
                        <span>E-mail</span>
                    <span>Název firmy</span>
                    </div>
                </div>
            {requests.rows.map((r: Row, i: number) => (
                <div key={i} className="w-full items-center flex flex-row justify-between border-2 py-2 px-2 rounded-lg">
                    <span>{String(r.email)}</span>
                    <span>{String(r.organization_name)}</span>
                    <div className="flex  w-1/2 flex-row space-x-2">
                        <AcceptRequest email={String(r.email)} org_id={Number(r.organization_id)}/>
                        <RejectRequest email={String(r.email)}/>
                    </div>
                </div>
            ))}
            </div>
            </>
            }
        </section>
    )
    }   
} 