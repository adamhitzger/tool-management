import { NextResponse, type NextRequest } from "next/server"
import {
  getUserFromSession,
  updateUserSessionExpiration,
} from "./database/session"
import { turso } from "./database/client"

export async function proxy(request: NextRequest) {
  const response = (await middlewareAuth(request)) ?? NextResponse.next()
  
  await updateUserSessionExpiration({
    set: (key, value, options) => {
      response.cookies.set({ ...options, name: key, value })
    },
    get: key => request.cookies.get(key),
  })

  return response
}

async function middlewareAuth(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith("/auth/")) {
    const user = await getUserFromSession(request.cookies)
    if (user == null) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url))
    }
  }

}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}