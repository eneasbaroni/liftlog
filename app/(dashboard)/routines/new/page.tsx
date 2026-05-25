'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createRoutine } from '@/app/actions/routines.actions'

const NewRoutinePage = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleCreate = () => {
    setError(null)

    if (!name.trim()) {
      setError('El nombre es obligatorio.')
      return
    }

    startTransition(async () => {
      const result = await createRoutine(name.trim())

      if (!result.success) {
        setError(result.error)
        return
      }

      // Redirect to the new routine's detail page to start adding exercises
      router.push(`/routines/${result.data._id}`)
    })
  }

  return (
    <div className="min-h-screen bg-ll-black-900 px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/routines"
          className="text-ll-black-300 hover:text-ll-white transition-colors text-[20px] leading-none"
        >
          ←
        </Link>
        <h1 className="text-ll-white text-[28px] leading-none">NUEVA RUTINA</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-ll-black-300 text-[10px] uppercase tracking-wider mb-1.5">
            Nombre
          </label>
          <input
            className="w-full bg-ll-black-600 text-ll-white rounded-[8px] px-3 py-2.5 text-sm border border-transparent focus:border-ll-orange focus:outline-none transition-colors placeholder:text-ll-black-300"
            placeholder="Mesociclo 1 — Push/Pull/Legs"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
        </div>

        <p className="text-ll-black-300 text-xs">
          Después de crear la rutina vas a poder agregar ejercicios para cada
          día de la semana.
        </p>

        {error && <p className="text-ll-orange text-xs">{error}</p>}

        <button
          type="button"
          onClick={handleCreate}
          disabled={isPending}
          className="w-full font-anton uppercase bg-ll-orange text-ll-white rounded-[8px] py-3 text-sm font-medium transition-opacity disabled:opacity-50 hover:opacity-90"
        >
          {isPending ? 'Creando...' : 'Crear rutina'}
        </button>
      </div>
    </div>
  )
}

export default NewRoutinePage
