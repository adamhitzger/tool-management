"use client"

import { SignOutType } from "@/lib/schema"
import { Button } from "../ui/button"
import { ActionResponse } from "@/types"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { signOut } from "@/database/actions"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export const actionState: ActionResponse<SignOutType> = {
    success: false,
    submitted: false,
    message: "",
}

export default function SignOutBtn({
    id
}: {
    id:number
}) {
    const [state, action, isPending] = useActionState(signOut, actionState);
    const router =useRouter()
    useEffect(() => {
    if(state.submitted){
        if(!state.success){
            toast.error(state.message);
        }else if(state.success) {
            toast.success(state.message);
            router.push("/auth/sign-in")
        }
    }       
    }, [state.submitted, state.success, state.message])
    return(
        <form className="max-w-80"
            action={action}
        >
        <input type="hidden" value={id} name="id"/>
        <Button 
        type="submit"
        >
            {isPending ? <Loader2 className="animate-spin"/> :"Odhlásit se"}
        </Button>
        </form>
    )
}
