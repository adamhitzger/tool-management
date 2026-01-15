"use client"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect } from "react";
import { ActionResponse } from "@/types";
import { SignInType } from "@/lib/schema";
import { signInVerify } from "@/database/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export const actionState: ActionResponse<SignInType> = {
    success: false,
    submitted: false,
    message: "",
}

export default function SignInForm(){
    const [state, action, isPending]= useActionState(signInVerify, actionState);
    useEffect(() => {
        if(state.submitted){
            if(!state.success){
                toast.error(state.message);
            }else if(state.success) {
                toast.success(state.message);
                redirect("/auth/verify")
            }
        }       
    }, [state.submitted, state.success, state.message])

    return(
        <form 
              action={action} 
              className='flex flex-col space-y-2'
              >
              <Label htmlFor='email'>E-mail*</Label>
              <Input 
                name='email' 
                type='email' 
                id='email'
                placeholder='Zadejte e-mailovou adresu'
                className='min-w-60'
              />
              <Button
                type='submit'
              >
               {isPending ? <Loader2 className="animate-spin"/> : "Přihlásit se"}
              </Button>
              <span>Pokud účet nemáte, <Link className="underline decoration-2 underline-offset-2" href="/auth/sign-up">zaregistrujte se</Link></span>
            </form>
    )
}