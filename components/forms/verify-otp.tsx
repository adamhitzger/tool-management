"use client"
import { Button } from "@/components/ui/button";
import { useActionState, useEffect } from "react";
import { ActionResponse } from "@/types";
import { VerifyOTP } from "@/lib/schema";
import { verifySignIn } from "@/database/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { 
    InputOTP,
    InputOTPGroup,
    InputOTPSlot
 } from "@/components/ui/input-otp";
import { redirect, useRouter } from "next/navigation";

export const actionState: ActionResponse<VerifyOTP> = {
    success: false,
    submitted: false,
    message: "",
}

export default function VerifyForm(){
    const [state, action, isPending]= useActionState(verifySignIn, actionState);
    useEffect(() => {
        if(state.submitted){
            if(!state.success){
                toast.error(state.message);
            }else if(state.success) {
                toast.success(state.message);
                redirect("/")
            }
        }       
    }, [state.submitted, state.success, state.message]);

    return(
        <form 
              action={action} 
              className='flex flex-col space-y-2'
            >
              <InputOTP
                name="otp"
                maxLength={6}
              >
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button
                type='submit'
              >
               {isPending ? <Loader2 className="animate-spin"/> : "Přihlásit se"}
              </Button>
        </form>
    )
}