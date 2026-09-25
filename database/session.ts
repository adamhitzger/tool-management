import { z } from "zod"
import crypto from "crypto"
import { getRedis } from "./redis"
import { pool } from "./client"
import { User } from "@/types"

const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 2
const COOKIE_SESSION_KEY = "session"

const sessionSchemaId = z.number()

type UserSession = z.infer<typeof sessionSchemaId>

export type Cookies = {
    set: (
      key: string,
      value: string,
      options: {
        secure?: boolean
        httpOnly?: boolean
        sameSite?: "strict" | "lax"
        expires?: number
      }
    ) => void
    get: (key: string) => { name: string; value: string } | undefined
    delete: (key: string) => void
  }

  function setCookie(sessionId: string, cookies: Pick<Cookies, "set">) {
    cookies.set(COOKIE_SESSION_KEY, sessionId, {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
    })
  }

  export async function createUserSession(
    user: UserSession,
    cookies: Pick<Cookies, "set">
  ) {
    console.log("UserId:",user)
    const sessionId = crypto.randomBytes(32).toString("hex").normalize()
    const redis = await getRedis()
    await redis.set(`${COOKIE_SESSION_KEY}:${sessionId}`, 
      JSON.stringify(sessionSchemaId.parse(user)), {
      EX: SESSION_EXPIRATION_SECONDS,
    })
  
    setCookie(sessionId, cookies)
  }

  export async function updateUserSessionData(
    user: UserSession,
    cookies: Pick<Cookies, "get">
  ) {
    const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
    if (sessionId == null) return null
  
     const redis = await getRedis()
    await redis.set(`${COOKIE_SESSION_KEY}:${sessionId}`, JSON.stringify(sessionSchemaId.parse(user)), {
      EX: SESSION_EXPIRATION_SECONDS,
    })
  }

  export function getUserFromSession(cookies: Pick<Cookies, "get">) {
    const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
    console.log(sessionId)
    if (sessionId == null) return null
  
    return getUserSessionById(sessionId)
  }

  export async function updateUserSessionExpiration(
    cookies: Pick<Cookies, "get" | "set">
  ) {
    const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
    if (sessionId == null) return null
  
    const user = await getUserSessionById(sessionId)
    if (user == null) return
    const redis =  await getRedis()
    await redis.set(`${COOKIE_SESSION_KEY}:${sessionId}`, JSON.stringify(user), {
      EX: SESSION_EXPIRATION_SECONDS,
    })
    setCookie(sessionId, cookies)
  }

  export async function removeUserFromSession(
    cookies: Pick<Cookies, "get" | "delete">
  ) {
    const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
    if (sessionId == null) return null
  
    const redis = await getRedis()
    await redis.del(`${COOKIE_SESSION_KEY}:${sessionId}`)
    cookies.delete(COOKIE_SESSION_KEY)
  }

  async function getUserSessionById(sessionId: string) {
     const redis = await getRedis()
    const rawUser = await redis.get(`${COOKIE_SESSION_KEY}:${sessionId}`)
    if (!rawUser) return null;
    const parsed = JSON.parse(rawUser);
    const { success, data: user } = sessionSchemaId.safeParse(parsed)
  
    return success ? user : null
  }

  export async function getUser(cookies: Pick<Cookies, "get">): Promise<User | null>{
    const userFromSession = await getUserFromSession(cookies);
    if (userFromSession == null) return null
    const fetchUser = await pool.query<User>(
            "SELECT * FROM users WHERE id = $1",
            [userFromSession]
        );
    if(fetchUser.rows.length === 0){
       return null
    }else {
      const user: User = {
        id: fetchUser.rows[0].id,
        name: fetchUser.rows[0].name || null,   
        surname: fetchUser.rows[0].surname || null,
        email: fetchUser.rows[0].email,
        role: fetchUser.rows[0].role
      }
      return user
    };
  }