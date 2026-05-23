import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE = 'll_session'
const PUBLIC_PATHS = ['/login']

export const middleware = async (req: NextRequest) => {
  const { pathname } = req.nextUrl

  // Inject pathname for BottomNav active state
  const res = NextResponse.next()
  res.headers.set('x-pathname', pathname)

  // Allow public paths through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return res
  }

  // Check session cookie
  const token = req.cookies.get(SESSION_COOKIE)?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Verify JWT
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    await jwtVerify(token, secret)
    return res
  } catch {
    // Token invalid or expired — clear cookie and redirect
    const redirectRes = NextResponse.redirect(new URL('/login', req.url))
    redirectRes.cookies.delete(SESSION_COOKIE)
    return redirectRes
  }
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|apple-touch-icon|icon-|manifest).*)'],
}
