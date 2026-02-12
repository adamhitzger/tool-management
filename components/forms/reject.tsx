"use client"

import { SignInType } from "@/lib/schema"
import { Button } from "../ui/button"
import { ActionResponse } from "@/types"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { reject } from "@/database/actions"
import { Loader2 } from "lucide-react"

export const actionState: ActionResponse<SignInType> = {
    success: false,
    submitted: false,
    message: "",
}

export default function RejectRequest({
    email
}: {
    email:string
}) {
    const [state, action, isPending] = useActionState(reject, actionState);
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
        variant={"destructive"}
        type="submit"
        >
            {isPending ? <Loader2 className="animate-spin"/> :"Zamítnout"}
        </Button>
        </form>
    )
}
