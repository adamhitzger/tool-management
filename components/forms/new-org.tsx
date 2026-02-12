"use client"

import { ChangeEvent, useState, useEffect, useActionState } from "react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { toast } from "sonner"
import { ActionResponse } from "@/types"
import { NewOrgType } from "@/lib/schema"
import { createOrg } from "@/database/actions"
import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"
import { MAX_ICON_SIZE } from "@/lib/utils"


export const actionState: ActionResponse<NewOrgType> = {
    success: false,
    submitted: false,
    message: "",
}

export default function NewOrg(){
    const [file, setFile] = useState<File | null>(null)
    console.log(file)
    const [state, action, isPending] = useActionState(createOrg, actionState);
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
        <form className="space-y-4" action={action}>
            <Label htmlFor="name">Název společnosti</Label>
            <Input name="name" type="text" placeholder={"Zadejte název společnosti"} className="w-60"/>
            <Label htmlFor="logo">Logo</Label>
            <Input 
                name="logo" 
                id="logo" 
                type="file" 
                accept="image/*"
                placeholder="Vložte soubor"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const files = e.target.files;
                    if(files){
                        if(files[0].type === "image/jpeg" || files[0].type === "image/png" || files[0].size < MAX_ICON_SIZE){
                            toast.success("Zadali jste jpeg obrazek")
                            setFile(files[0])
                        }else{
                            toast.error("Zadali jste neco jineho než obrazek nebo je Váš obrázek větší než 50 KB")
                        }
                       
                    }    
                }}
            />
            <Button
                type="submit"
                className="w-60"
            >
               {isPending? <Loader2 className="animate-spin"/> :"Vytvořit"}
            </Button>
        </form>
    )
}