"use client"

import { Button } from "../ui/button"
import { ActionResponse } from "@/types"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { DeleteType } from "@/lib/schema"
import { deleteAccount } from "@/database/actions"

export const actionState: ActionResponse<DeleteType> = {
    success: false,
    submitted: false,
    message: "",
}

export default function DeleteBtn({email, id}: {email: string, id:number}){
    const [state, action, isPending]= useActionState(deleteAccount, actionState);
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
        <input type="hidden" value={id} name="id"/>
        <Button 
        variant={"destructive"}
        type="submit"
        >
            {isPending ? <Loader2 className="animate-spin"/> :"Smazat účet"}
        </Button>
        </form>
    )
}