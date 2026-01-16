"use client"

import { DeleteType } from "@/lib/schema"
import { Button } from "../ui/button"
import { ActionResponse } from "@/types"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { acceptRequest } from "@/database/actions"
import { Loader2 } from "lucide-react"

export const actionState: ActionResponse<DeleteType> = {
    success: false,
    submitted: false,
    message: "",
}

export default function AcceptRequest({
    email,
    org_id
}: {
    email:string,
    org_id: number
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
        <input type="hidden" value={org_id} name="id"/>
        <Button 
        type="submit"
        >
            {isPending ? <Loader2 className="animate-spin"/> :"Schválit"}
        </Button>
        </form>
    )
}