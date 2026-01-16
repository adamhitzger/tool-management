import SignUpForm from "@/components/forms/sign-up"
import { turso } from "@/database/client"

export default async function SignUp(){
    const {rows} = await turso.execute("SELECT id,name FROM organizations");
    const organizations = rows.map(r => ({
        id: Number(r.id),
        name: String(r.name),
    }));
    return(
         <div className="p-4 min-h-screen w-full flex flex-col items-center justify-center">
                  <div className='flex flex-col space-y-4'>
                    <h1 className='text-center'>Houfek Tool management registration</h1>
                    <SignUpForm rows={organizations}/>
                </div>
            </div>
    )
}