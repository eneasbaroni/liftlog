import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET
const SESSION_COOKIE = 'll_session'
const SESSION_DURATION = '30d'

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables')
}

const secret = new TextEncoder().encode(JWT_SECRET)

// ── Token ────────────────────────────────────────────────────────────────────

export const signToken = async (): Promise<string> => {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(secret)
}

export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

// ── Cookie ───────────────────────────────────────────────────────────────────

export const SESSION_COOKIE_NAME = SESSION_COOKIE

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
}

// ── Credentials ──────────────────────────────────────────────────────────────

export const validateCredentials = (
  username: string,
  password: string
): boolean => {
  return (
    username === process.env.APP_USERNAME &&
    password === process.env.APP_PASSWORD
  )
}
