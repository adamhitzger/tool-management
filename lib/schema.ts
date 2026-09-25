import * as z from "zod";

export const signIn = z.object({
    email: z.email().min(1, {message: "Email je povinný"})
});

export const signUpSchema = z.object({
    email: z.email().min(1, {message: "Email je povinný"})
});

export const verify = z.object({
    otp: z.string()
});

export const update = z.object({
    name: z.string().min(1, {message: "Jméno je povinné"}),
    surname: z.string().min(1, {message: "Přijmení je povinné"}),
    id: z.number()
});

export const signOutSchema = z.object({
    id: z.number()
})

export const deleteSchema = z.object({
     email: z.email().min(1, {message: "Email je povinný"}),
    id: z.number()
})

export const addMachineSchema = z.object({
    name: z.string().min(1)
});

export type SignInType = z.infer<typeof signIn>;
export type VerifyOTP = z.infer<typeof verify>;
export type UpdateUserType = z.infer<typeof update>;
export type SignOutType = z.infer<typeof signOutSchema>;
export type SignUpType = z.infer<typeof signUpSchema>;
export type DeleteType = z.infer<typeof deleteSchema>;
export type AddMachineType = z.infer<typeof addMachineSchema>