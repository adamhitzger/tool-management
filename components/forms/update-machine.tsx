"use client"

import { useActionState, useEffect, useState } from "react"
import { Pen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "../ui/input"
import { ActionResponse } from "@/types"
import { AddMachineType } from "@/lib/schema"
import { createMachine } from "@/database/actions"
import { toast } from "sonner"

const MACHINE_TYPES = [
  { value: "Spider", label: "Spider" },
  { value: "Fenix", label: "Fenix" },
  { value: "Titan", label: "Titan" },
  { value: "Promax", label: "Promax" },
  { value: "Promax-x3", label: "Promax X3" },
  { value: "Promax-x5", label: "Promax X5" },
]

export const actionState: ActionResponse<AddMachineType> = {
    success: false,
    submitted: false,
    message: "",
}

export function UpdateMachineDialog({
    id
}: { id: number}) {
  const [open, setOpen] = useState(false)
  const [state, action, isPending] = useActionState(createMachine, actionState)
  
  useEffect(() => {
    if(state.submitted){
        if(state.success){
            toast.success(state.message);
        }else{
            toast.error(state.message)
        }
        setOpen(false)
    }
  }, [state.success, state.submitted, state.message, setOpen])
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="flex flex-row">
          <Pen className="mr-2 h-4 w-4" />
          {"Upravit"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{"Upravit stroj"}</DialogTitle>
          <DialogDescription>
            {"Vyberte CNC stroj, který chcete upravit v systému."}
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="machine-type">Název stroje</Label>
              <Select
                name="name" 
              >
                <SelectTrigger id="machine-type" className="w-full">
                  <SelectValue placeholder="Vyberte stroj..." className="w-full"/>
                </SelectTrigger>
                <SelectContent>
                  {MACHINE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="hidden" value={id} name="id"/>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {"Zrušit"}
            </Button>
            <Button type="submit" disabled={isPending}>
              {"Upravit stroj"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
