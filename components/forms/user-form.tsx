"use client"

import { User } from "@/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ActionResponse } from "@/types"
import { UpdateUserType } from "@/lib/schema"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { updateUser } from "@/database/actions"

export const actionState: ActionResponse<UpdateUserType> = {
    success: false,
    submitted: false,
    message: "",
}

export default function UserForm({
    user
}: {
    user: User
}){
    const [state, action, isPending] = useActionState(updateUser, actionState);
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
        <form
            action={action}
            className="flex flex-col space-y-4"
        >
            <Input name="name" type="text" placeholder={user.name ?? ""} className="w-60"/>
            <Input name="surname" type="text" placeholder={user.surname ?? ""} className="w-60"/>
            <Input placeholder={user.email} readOnly className="w-60"/>
            <Input name="id" type="hidden" value={user.id}/>
            <Button
                type="submit"
                className="w-60"
            >
               {isPending? <Loader2 className="animate-spin"/> :"Změnit údaje"}
            </Button>
            
        </form>
    )
}
