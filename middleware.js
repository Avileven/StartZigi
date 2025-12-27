
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  // ✅ FIX: auth routes must be public, otherwise you get redirect loops
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/reset-password',
    '/venture-landing',

    // ✅ Supabase auth callback paths
    '/auth',
    '/auth/callback',
  ]

  const isPublicPath = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  // ✅ if not logged in and not public -> go login
  if (!session && !isPublicPath) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('next', pathname + req.nextUrl.search)
    return NextResponse.redirect(redirectUrl)
  }

  // ✅ if logged in and on login/register -> go dashboard
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}

