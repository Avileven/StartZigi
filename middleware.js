import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // ✅ FIX #1: להרחיב רשימת public routes
  // חשוב במיוחד: auth callback אחרי אימות במייל, אחרת נוצרת לולאת redirect (ריצוד).
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/reset-password',
    '/venture-landing',

    // ✅ חשוב: מסלולי callback של סופאבייס
    '/auth',
    '/auth/callback',
  ]

  const pathname = req.nextUrl.pathname
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(path + '/'))

  // ✅ FIX #2: אם אין session והדף לא ציבורי -> הפניה ל-login
  // כולל שמירה של כל ה-URL (path + query) כדי לחזור בדיוק לאותו מקום
  if (!session && !isPublicPath) {
    const redirectUrl = new URL('/login', req.url)
    const fullPathWithQuery = req.nextUrl.pathname + req.nextUrl.search
    redirectUrl.searchParams.set('next', fullPathWithQuery) // ✅ FIX: next (לא רק pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // ✅ FIX #3: אם יש session והמשתמש ב-login/register -> הפניה ל-dashboard
  // אבל לא להפריע ל-auth callback באמצע יצירת session.
  if (
    session &&
    (pathname === '/login' || pathname === '/register')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  // ✅ FIX #4: לוודא שאנחנו לא תופסים static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}



