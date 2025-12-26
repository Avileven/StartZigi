import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  // ✅ דפים ציבוריים אמיתיים (בלי '/' עם startsWith)
  const isPublicPath =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/venture-landing')

  // אם אין session והדף לא ציבורי - הפנה ל-login
  if (!session && !isPublicPath) {
    const redirectUrl = new URL('/login', req.url)

    // ✅ משתמשים ב-next ושומרים גם querystring
    const next = pathname + (req.nextUrl.search || '')
    redirectUrl.searchParams.set('next', next)

    return NextResponse.redirect(redirectUrl)
  }

  // אם יש session והמשתמש ב-login/register - הפנה ל-dashboard
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}

