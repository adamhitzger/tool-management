"use client"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect } from "react";
import { ActionResponse } from "@/types";
import { SignUpType } from "@/lib/schema";
import { signUp } from "@/database/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const actionState: ActionResponse<SignUpType> = {
    success: false,
    submitted: false,
    message: "",
}

export default function SignUpForm(){
    const [state, action, isPending]= useActionState(signUp, actionState);
    const router = useRouter()
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
               {isPending ? <Loader2 className="animate-spin"/> : "Zaregistrovat se"}
              </Button>
              <span className="text-center">Pokud už účet máte,<Link className="underline decoration-2 underline-offset-2" href="/auth/sign-in"> přihlašte se</Link></span>
            </form>
    )
}