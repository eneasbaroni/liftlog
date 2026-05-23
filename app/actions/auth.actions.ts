'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  signToken,
  validateCredentials,
  SESSION_COOKIE_NAME,
  cookieOptions,
} from '@/lib/auth'

export const login = async (
  username: string,
  password: string
): Promise<{ success: false; error: string } | never> => {
  const valid = validateCredentials(username, password)

  if (!valid) {
    return { success: false, error: 'Usuario o contraseña incorrectos.' }
  }

  const token = await signToken()
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, token, cookieOptions)

  redirect('/week')
}

export const logout = async (): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  redirect('/login')
}
