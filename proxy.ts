import { NextRequest, NextResponse } from 'next/server'

export const proxy = (req: NextRequest) => {
  const res = NextResponse.next()
  res.headers.set('x-pathname', req.nextUrl.pathname)
  return res
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|apple-touch-icon|icon-|manifest).*)'],
}
