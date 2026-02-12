"use server";

import { addMachineSchema, AddMachineType, deleteSchema, DeleteType, neworgSchema, NewOrgType, signIn, SignInType, signOutSchema, SignOutType, signUpSchema, SignUpType, update, UpdateUserType, verify, VerifyOTP } from "@/lib/schema";
import { ActionResponse } from "@/types";
import { promises as fs } from 'fs';
import nodemailer from "nodemailer"
import { pool } from "./client";
import { render } from "@react-email/components";
import { SignInEmail } from "@/components/emails/sign-in-mail";
import { createUserSession, getUserFromSession, removeUserFromSession } from "./session";
import { cookies } from "next/headers";
import { MAX_ICON_SIZE } from "@/lib/utils";
import path from "path";
import slugify from "slugify"


function smtp(){
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.FROM_MAIL!,
            pass: process.env.FROM_PASSWORD!
        },
    });
}

export async function deleteMachine(machineId: number): Promise<{success: boolean}>{
    try{

        const sessionUser = await getUserFromSession(await cookies());
        
        if(sessionUser === null){
            return{
                success: false,
            }
        }
        
        const deleteMachineQ = await pool.query(
            `
            DELETE FROM machines WHERE id = $1 RETURNING *
            `,
            [machineId]
        )

        if(deleteMachineQ.rowCount === 0){
            return {
                success: false,
            }
        }else{
        return {
                success: true,
            }
        }
    }catch(error){
        console.error("Error v akci deleteMachine: ", error);
        return{
           success: false
        }
    }
}

export async function createMachine(prevState: ActionResponse<AddMachineType>, formData: FormData): Promise<ActionResponse<AddMachineType>>{
    try{
        const sessionUser = await getUserFromSession(await cookies());
        
        if(sessionUser === null){
            return{
                submitted: true,
                success: false,
                message: "Nejste uživatelem databáze! Kontaktujte administrátora."
            }
        }

        const nondata: AddMachineType = {
            name: formData.get("name") as string,
            orgId: Number(formData.get("orgId"))
        }

        const validation = addMachineSchema.safeParse(nondata);

        if(!validation.success){
            return {
                submitted: true,
                success: false,
                message: "Špatně zadaná data"
            }
        }

        const data = validation.data
        
        const insertMachineQ = await pool.query(`
            INSERT INTO machines (name, is_running, organization) VALUES ($1,$2,$3) RETURNING *;
            `,
            [data.name, 0, data.orgId]
        )

        if(insertMachineQ.rowCount === 0){
            return {
                submitted: true,
                success: false,
                message: "Problémy s databází, kontaktujte admina"
            }
        }else{
        
        return {
                submitted: true,
                success: true,
                message: "Stroj byl přidán"
            }
        }
    }catch(error){
        console.error("Error v akci createMachine: ", error);
        return {
            submitted: true,
            success: false,
            message: "Nepovedlo se vytvořit stroj v systému"
        }
    }
}

export async function createOrg(prevState: ActionResponse<NewOrgType>, formData: FormData): Promise<ActionResponse<NewOrgType>>{
    try{
        
        const nondata: NewOrgType = {
            name: formData.get("name") as string,
            file: formData.get("logo") as File,
        }
        console.log(nondata.file)
        const validation = neworgSchema.safeParse(nondata);

        if(!validation.success){
            console.log(validation.error)
            return{
                success: false,
                submitted: true,
                message: "Nevyplnili jste všechna pole",                
            }
        }

        const data = validation.data;        

        if(data.file.size > MAX_ICON_SIZE){
            return{
                success: false,
                submitted: true,
                message: "Obrázek je větší než 50 bajtů",                
            }
        }

        const bytes = await data.file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "public/icons");

        const filePath = path.join(uploadDir, data.file.name);
        await fs.writeFile(filePath, buffer)
        const slug = slugify(data.name,{
            lower: true,
            strict: true,
            locale: "cs",
        })
        const timestamp = Date.now()
        
        const insertRequest = await pool.query("INSERT INTO organizations (name, slug, created_at, icon_name) VALUES ($1, $2, $3,$4) RETURNING *",
         [data.name, slug , timestamp ,data.file.name]
        );

        if(insertRequest.rowCount === 0){
            return {
            submitted: true,
            success: false,
            message: "Nepodařilo se uložit data, kontaktujte superadministrátora."
            }
        }


        return{
            success: true,
            submitted: true,
            message: "Organizace byla vytvořena",                
        }
    }catch(error){
        console.log(error)
        return{
            success: false,
            submitted: true,
            message: "Nepovedlo se vytvořit organizace",                
        }
    }
}

async function generateCode(email: string): Promise<{code: string | null, success: boolean}>{
    const code = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    const now = Date.now();
    const expires_at = Date.now() + 600;
    
    const insertCode = await pool.query(
        "INSERT INTO verification_codes (identifier, code, created_at, expires_at) VALUES ($1,$2,$3,$4) RETURNING *",
        [email, code, now, expires_at]
    );

    if(insertCode.rowCount === 0){
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
        
        const updateUserQ = await pool.query(
            "UPDATE users SET name = $1, surname = $2 WHERE id = $3 RETURNING *",
            [data.name, data.surname, data.id]
        );

        if(updateUserQ.rowCount === 0){
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
        
        const verifyCode = await pool.query(
            "SELECT id, expires_at, identifier FROM verification_codes WHERE code = $1",
             [data.otp]
        );
        const now = Date.now();

        if(now < Number(verifyCode.rows[0].expires_at)){
            const deleteCode = await pool.query(
            "DELETE FROM verification_codes WHERE id = $1 RETURNING *",
             [verifyCode.rows[0].id]
            )
            if(deleteCode.rowCount === 0){
                return {
                    success: false,
                    submitted: true,
                    message: "Kód vyexpiroval. Přihlaste se znovu."
                }
            }
        }

        const deleteCode = await pool.query(
            "DELETE FROM verification_codes WHERE id = $1 RETURNING *",
            [verifyCode.rows[0].id]
        );

        if(deleteCode.rowCount === 0){
            return {
                success: false,
                submitted: true,
                message: "Nepovedlo se smazat kód. Zkuste znovu."
            }
        }

        const getUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [String(verifyCode.rows[0].identifier)]
        );
        await createUserSession(getUser.rows[0].id, await cookies());
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
        ;
        const user = await pool.query(
            "SELECT u.id, o.name AS organization_name FROM users u JOIN organizations o ON u.organization_id = o.id WHERE u.email = $1;",
            [data.email]
        );

        if(user.rows.length === 0){
            return {
                submitted: true,
                success: false,
                message: "Uživatel s tímto e-mailem neexistuje. Zaregistrujte se a počkejte na schválení."
            }
        }
        console.log(user.rows[0])
        const code = await generateCode(data.email);
        console.log(code.code)
        if(code.code === null && !code.success){
            return {
                success: false,
                submitted: true,
                message: "Nepovedlo se vytvořit kód. Kontaktujte programátora."
            }
        }

        const html = await render(<SignInEmail code={String(code.code)} company={String(user.rows[0].organization_name)}/>);
    
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
        ;
        const user = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [data.email]
        );

        if(user.rows.length > 0){
            return {
                submitted: true,
                success: false,
                message: "Uživatel s tímto e-mailem existuje. Přihlašte se.",
                inputs: nondata
            }
        }
        const insertRequest = await pool.query(
            "INSERT INTO requests (email, organization_id) VALUES ($1, $2) RETURNING*;",
            [data.email, data.org]
        );

        if(insertRequest.rowCount === 0){
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
        const delAccount = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING*",
            [data.id]
        )

        if(delAccount.rowCount === 0){
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
        ;
        const getUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [data.email]
        );

        if(getUser.rows.length > 0){
            const delAccept = await pool.query(
            "DELETE FROM requests WHERE email = $1 RETURNING*",
            [String(data.email)]
            )

            if(delAccept.rowCount === 0){
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

        const accept = await pool.query(
            "INSERT INTO users (name, surname, email, role, organization_id) VALUES ($1,$2,$3,$4,$5) RETURNING*",
            ["Změnte si jméno","Změnte si přijmení",data.email, "PLEBS", data.id]
        ) 

        if(accept.rowCount === 0){
            return {
            submitted: true,
            success: false,
            message: "Nepovedlo se Vaší schválit žadost",
            }
        }
        console.log(data.email)
        const delAccept = await pool.query(
            "DELETE FROM requests WHERE email = $1 RETURNING*",
            [String(data.email)]
        )

        if(delAccept.rowCount === 0){
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
        ;
        const delAccept = await pool.query(
            "DELETE FROM requests WHERE email = $1 RETURNING*",
            [String(data.email)]
        )

        if(delAccept.rowCount === 0){
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