'use client'

import { useState, useTransition } from 'react'
import { login } from '@/app/actions/auth.actions'

const LoginPage = () => {
  const [isPending, startTransition] = useTransition()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = () => {
    setError(null)

    if (!username.trim() || !password.trim()) {
      setError('Completá todos los campos.')
      return
    }

    startTransition(async () => {
      const result = await login(username.trim(), password)
      if (result && !result.success) {
        setError(result.error)
      }
    })
  }

  const inputClass = [
    'w-full bg-ll-black-600 text-ll-white rounded-[8px] px-4 py-3 text-[14px]',
    'border border-transparent focus:border-ll-orange focus:outline-none transition-colors',
    'placeholder:text-ll-black-300',
  ].join(' ')

  return (
    <div className="min-h-screen bg-ll-black-900 flex flex-col items-center justify-center px-6">
      {/* Logo + title */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="w-16 h-16 bg-ll-black-600 rounded-[16px] flex items-center justify-center">
          <img src="/logo.png" alt="logo" />
        </div>
        <h1 className="text-ll-white text-[32px] leading-none tracking-tight">
          LIFTLOG
        </h1>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <input
          type="text"
          placeholder="Usuario"
          autoCapitalize="none"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          className={inputClass}
        />
        <input
          type="password"
          placeholder="Contraseña"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          className={inputClass}
        />

        {error && <p className="text-ll-orange text-xs px-1">{error}</p>}

        <button
          type="button"
          onClick={handleLogin}
          disabled={isPending}
          className="w-full bg-ll-orange text-ll-white rounded-[8px] py-3 text-[14px] font-medium mt-1 transition-opacity disabled:opacity-50 hover:opacity-90"
        >
          {isPending ? 'Ingresando...' : 'Ingresar'}
        </button>
      </div>
    </div>
  )
}

export default LoginPage
