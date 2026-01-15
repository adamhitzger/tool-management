"use client"

import { SignInType } from "@/lib/schema"
import { Button } from "../ui/button"
import { ActionResponse } from "@/types"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { acceptRequest } from "@/database/actions"
import { Loader2 } from "lucide-react"

export const actionState: ActionResponse<SignInType> = {
    success: false,
    submitted: false,
    message: "",
}

export default function AcceptRequest({
    email
}: {
    email:string
}) {
    const [state, action, isPending] = useActionState(acceptRequest, actionState);
    useEffect(() => {
    if(state.submitted){
        if(!state.success){
            toast.error(state.message);
        }else if(state.success) {
            toast.success(state.message);       
        }
    }       
    }, [state.submitted, state.success, state.message])

    return(
        <form className="max-w-80"
            action={action}
        >
        <input type="hidden" value={email} name="email"/>
        <Button 
        type="submit"
        >
            {isPending ? <Loader2 className="animate-spin"/> :"Schválit"}
        </Button>
        </form>
    )
}