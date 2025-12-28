//middleware
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // אפשר להשאיר את זה בשביל refresh cookies אם יש, אבל לא עושים redirects פה.
  try {
    await supabase.auth.getSession()
  } catch (e) {
    // לא עושים כלום
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}


