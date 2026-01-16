"use server";

import { deleteSchema, DeleteType, signIn, SignInType, signOutSchema, SignOutType, signUpSchema, SignUpType, update, UpdateUserType, verify, VerifyOTP } from "@/lib/schema";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer"
import { turso } from "./client";
import { render } from "@react-email/components";
import { SignInEmail } from "@/components/emails/sign-in-mail";
import { createUserSession, getUserFromSession, removeUserFromSession } from "./session";
import { cookies } from "next/headers";

function smtp(){
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.FROM_MAIL!,
            pass: process.env.FROM_PASSWORD!
        },
    });
}

async function generateCode(email: string): Promise<{code: string | null, success: boolean}>{
    const code = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    const now = Date.now();
    const expires_at = Date.now() + 600;
    const insertCode = await turso.execute({
        sql: "INSERT INTO verification_codes (identifier, code, created_at, expires_at) VALUES (?,?,?,?)",
        args: [email, code, now, expires_at]
    });

    if(!insertCode.rowsAffected){
        return {
            code: null,
            success: false
        }
    }else{
        return {
            success: true,
            code: code
        }
    }
}

//Authorizace
export async function signOut(
    prevState: ActionResponse<SignOutType>,
    formData: FormData
): Promise<ActionResponse<SignOutType>> {
    try{
    const nondata: SignOutType = {
        id: Number(formData.get("id"))
    }
    const validation = signOutSchema.safeParse(nondata);
    if(!validation.success){
        return{
            submitted: true,
            success: false,
            message: "Nepovedlo se Vás odhlásit"
        }
    }
    await removeUserFromSession(await cookies());

    return{
            submitted: true,
            success: true,
            message: "Byl jste odhlášen"
        }
    }catch(error){
        console.error(error)
        return{
            submitted: true,
            success: false,
            message: "Nepovedlo se Vás odhlásit"
        }
    }
}

export async function updateUser(
    prevState: ActionResponse<UpdateUserType>,
    formData: FormData
): Promise<ActionResponse<UpdateUserType>> {

    try{
        const sessionUser = await getUserFromSession(await cookies());

        if(sessionUser === null){
            return{
                submitted: true,
                success: false,
                message: "Nejste uživatelem databáze! Kontaktujte administrátora."
            }
        }
        const nondata: UpdateUserType = {
            name: formData.get("name") as string,
            surname: formData.get("surname") as string,
            id: Number(formData.get("id"))
        } 

        const validation = update.safeParse(nondata)

        if(!validation.success){
            return{
            submitted: true,
            success: false,
            message: "Zadali jste špatně Vaše údaje"
            }
        }
        const data = validation.data;
        if(sessionUser !== data.id){
            return{
            submitted: true,
            success: false,
            message: "Nejste oprávněn k této akci."
            }
        }

        const updateUserQ = await turso.execute({
            sql: "UPDATE users SET name = ?, surname = ? WHERE id = ?",
            args: [data.name, data.surname, data.id]
        });

        if(!updateUserQ.rowsAffected){
            return{
            submitted: true,
            success: false,
            message: "Nepovedlo se změnit Vaše údaje."
            }
        }
        return{
            submitted: true,
            success:true,
            message: "Vaše údaje byly změněny"
        }
    }catch(error){
        console.error(error)
        return{
            submitted: true,
            success: false,
            message: "Nepovedlo se změnit Vaše údaje"
        }
    }
}

export async function verifySignIn(
    prevState: ActionResponse<VerifyOTP>,
    formData: FormData
): Promise<ActionResponse<VerifyOTP>>{

    try{
        const nondata: VerifyOTP = {
            otp: formData.get("otp") as string
        }
        const validation = verify.safeParse(nondata);

        if(!validation.success){
            return {
                success: false,
                submitted: true,
                message: "Zadal jste špatně kód."
            }
        }
        const data = validation.data
        const verifyCode = await turso.execute({
            sql: "SELECT id, expires_at, identifier FROM verification_codes WHERE code = ?",
            args: [data.otp]
        });
        const now = Date.now();

        if(now < Number(verifyCode.rows[0].expires_at)){
            const deleteCode = await turso.execute({
            sql: "DELETE FROM verification_codes WHERE id = ?",
            args: [Number(verifyCode.rows[0].id)]
            })
            if(deleteCode.rowsAffected){
                return {
                    success: false,
                    submitted: true,
                    message: "Kód vyexpiroval. Přihlaste se znovu."
                }
            }
        }

        const deleteCode = await turso.execute({
            sql: "DELETE FROM verification_codes WHERE id = ?",
            args: [Number(verifyCode.rows[0].id)]
        });

        if(!deleteCode.rowsAffected){
            return {
                success: false,
                submitted: true,
                message: "Nepovedlo se smazat kód. Zkuste znovu."
            }
        }
        const getUser = await turso.execute({
            sql: "SELECT * FROM users WHERE email = ?",
            args: [String(verifyCode.rows[0].identifier)]
        });
        await createUserSession(Number(getUser.rows[0].id), await cookies());
        return {
                success: true,
                submitted: true,
                message: "Zadaný kód je spravný. Budete přesměrováni."
        }
    }catch(error){
        console.error(error)
        return {
            success: false,
            submitted: true,
            message: "Nepodařilo se ověřit kód."
        }
    }
}

export async function signInVerify(
    prevState: ActionResponse<SignInType>,
    formData: FormData
): Promise<ActionResponse<SignInType>>{

    const mail = smtp();

    try{
        const nondata: SignInType = {
            email: formData.get("email") as string,
        };

        const validation = signIn.safeParse(nondata);

        if(!validation.success) {
            return{
                success: false,
                submitted: true,
                message: "Zadali jste špatně e-mail",
                errors: validation.error.flatten().fieldErrors,
                inputs: nondata
            }
        }

        const data = validation.data;

        const user = await turso.execute({
            sql:"SELECT id FROM users WHERE email = ?",
            args: [data.email]
        });

        if(user.rows.length === 0){
            return {
                submitted: true,
                success: false,
                message: "Uživatel s tímto e-mailem neexistuje. Zaregistrujte se a počkejte na schválení."
            }
        }
        console.log(user.rows[0].id)
        const code = await generateCode(data.email);
        console.log(code.code)
        if(code.code === null && !code.success){
            return {
                success: false,
                submitted: true,
                message: "Nepovedlo se vytvořit kód. Kontaktujte programátora."
            }
        }

        const html = await render(<SignInEmail code={String(code.code)}/>);
    
        const sendCode = await mail.sendMail({
            subject: "Autorizační kód pro přihlášení",
            from: process.env.FROM_MAIL,
            to: data.email,
            html: html,
        });

        if(!sendCode.accepted){
            return {
                submitted: true,
                success: true,
                message: "Byl Vám zaslán kód do e-mailu."
            }
        }
        return {
            submitted: true,
            success: true,
            message: "Byl Vám zaslán kód do e-mailu."
        }
    }catch(error){
        console.error(error)
        return {
            submitted: true,
            success: false,
            message: "Nepovedlo se odeslat Vaše údaje"
        }
    }
}

export async function signUp(
    prevState: ActionResponse<SignUpType>,
    formData: FormData
): Promise<ActionResponse<SignUpType>>{

    try{
        const nondata: SignUpType = {
            email: formData.get("email") as string,
            org: Number(formData.get("org"))
        };

        const validation = signUpSchema.safeParse(nondata);

        if(!validation.success) {
            return{
                success: false,
                submitted: true,
                message: "Zadali jste špatně e-mail",
                errors: validation.error.flatten().fieldErrors,
                inputs: nondata
            }
        }

        const data = validation.data;

        const user = await turso.execute({
            sql:"SELECT id FROM users WHERE email = ?",
            args: [data.email]
        });

        if(user.rows.length > 0){
            return {
                submitted: true,
                success: false,
                message: "Uživatel s tímto e-mailem existuje. Přihlašte se.",
                inputs: nondata
            }
        }
        const insertRequest = await turso.execute({
            sql:"INSERT INTO requests (email, organization_id) VALUES (?, ?, );",
            args: [data.email, data.org]
        });

        if(!insertRequest.rowsAffected){
            return {
            submitted: true,
            success: false,
            message: "Nepodařilo se zaslat žádost."
            }
        }

        return {
            submitted: true,
            success: true,
            message: "Vaše žádost o registraci byla zaslána administrátorovi."
        }
    }catch(error){
        console.error(error)
        return {
            submitted: true,
            success: false,
            message: "Nepovedlo se odeslat Vaše údaje",
        }
    }
}

export async function deleteAccount(
    prevState: ActionResponse<DeleteType>,
    formData: FormData
): Promise<ActionResponse<DeleteType>>{
    try{
        const nondata: DeleteType = {
            email: formData.get("email") as string,
            id: Number(formData.get("id"))
        };

        const validation = deleteSchema.safeParse(nondata);

        if(!validation.success){
            return {
            submitted: true,
            success: false,
            message: "Zadali jste špatně data",
            errors: validation.error.flatten().fieldErrors,
            inputs: nondata
            }
        }

        const data = validation.data;
        await removeUserFromSession(await cookies());
        const delAccount = await turso.execute({
            sql:"DELETE FROM users WHERE id = ?",
            args: [data.id]
        })

        if(!delAccount.rowsAffected){
            return {
                submitted: true,
                success: false,
                message: "Nepovedlo se smazat účet",
            }
        }
        return {
            submitted: true,
            success: true,
            message: "Účet byl smazán",
        }
    }catch(error){
        console.log(error)
        return {
            submitted: true,
            success: false,
            message: "Nepovedlo se schválit žadost",
        }
    }
}

//User Requests
export async function acceptRequest(
    prevState: ActionResponse<DeleteType>,
    formData: FormData
): Promise<ActionResponse<DeleteType>>{
    try{
        const nondata: DeleteType = {
            email: formData.get("email") as string,
            id: Number(formData.get("id"))
        };

        const validation = deleteSchema.safeParse(nondata);

        if(!validation.success) {
            return{
                success: false,
                submitted: true,
                message: "Zadali jste špatně e-mail",
                errors: validation.error.flatten().fieldErrors,
                inputs: nondata
            }
        }

        const data = validation.data;

        const getUser = await turso.execute({
            sql:"SELECT * FROM users WHERE email = ?",
            args: [data.email]
        });

        if(getUser.rows.length > 0){
            const delAccept = await turso.execute({
            sql: "DELETE FROM requests WHERE email = ?",
            args: [String(data.email)]
            })

            if(!delAccept.rowsAffected){
            return {
                submitted: true,
                success: false,
                message: "Nepovedlo se odmítnout žadost",
            }
            }
            return {
                success: false,
                submitted: true,
                message: "Uživatel už v databázi existuje",
                inputs: nondata
            }
        }

        const accept = await turso.execute({
            sql: "INSERT INTO users (name, surname, email, role, organization_id) VALUES (?,?,?,?,?)",
            args: ["Změnte si jméno","Změnte si přijmení",data.email, "PLEBS", data.id]
        }) 

        if(!accept.rowsAffected){
            return {
            submitted: true,
            success: false,
            message: "Nepovedlo se Vaší schválit žadost",
            }
        }
        console.log(data.email)
        const delAccept = await turso.execute({
            sql: "DELETE FROM requests WHERE email = ?",
            args: [String(data.email)]
        })

        if(!delAccept.rowsAffected){
            return {
                submitted: true,
                success: false,
                message: "Nepovedlo se schválit žadost",
            }
        }
        return {
            submitted: true,
            success: true,
            message: "Žádost byla potvrzena",
        }
    }catch(error){
        console.error(error)
        return {
            submitted: true,
            success: false,
            message: "Nepovedlo se schválit žadost",
        }
    }
}

export async function reject(
    prevState: ActionResponse<SignInType>,
    formData: FormData
): Promise<ActionResponse<SignInType>>{
    try{
        const nondata: SignInType = {
            email: formData.get("email") as string,
        };

        const validation = signIn.safeParse(nondata);

        if(!validation.success) {
            return{
                success: false,
                submitted: true,
                message: "Zadali jste špatně e-mail",
                errors: validation.error.flatten().fieldErrors,
                inputs: nondata
            }
        }

        const data = validation.data;

        const delAccept = await turso.execute({
            sql: "DELETE FROM requests WHERE email = ?",
            args: [String(data.email)]
        })

        if(!delAccept.rowsAffected){
            return {
                submitted: true,
                success: false,
                message: "Nepovedlo se odmítnout žadost",
            }
        }
        return {
            submitted: true,
            success: true,
            message: "Žádost nebyla odmítnuta",
        }
    }catch(error){
        console.error(error)
        return {
            submitted: true,
            success: false,
            message: "Nepovedlo se odmítnout žadost",
        }
    }
}