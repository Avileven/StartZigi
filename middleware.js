import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // רשימת דפים ציבוריים (לא דורשים התחברות)
  const publicPaths = ['/login', '/register', '/', '/venture-landing']
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path))

  // אם אין session והדף לא ציבורי - הפנה ל-login
  if (!session && !isPublicPath) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // אם יש session והמשתמש ב-login/register - הפנה ל-dashboard
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}