'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { RoutineCardProps } from './types'

export const RoutineCard = ({
  routine,
  onSetActive,
  onDelete,
}: RoutineCardProps) => {
  const [isPending, startTransition] = useTransition()

  const exerciseCount = Object.values(routine.days).reduce(
    (acc, exs) => acc + (exs?.length ?? 0),
    0
  )

  const activeDays = Object.values(routine.days).filter(
    (exs) => exs && exs.length > 0
  ).length

  const handleSetActive = () => {
    startTransition(async () => {
      await onSetActive(routine._id)
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      await onDelete(routine._id)
    })
  }

  return (
    <div
      className={[
        'rounded-[10px] p-3 flex items-center gap-3 transition-colors',
        routine.active
          ? 'bg-ll-black-orange border border-ll-orange'
          : 'bg-ll-black-600 hover:bg-ll-black-orange',
      ].join(' ')}
    >
      {/* Active indicator */}
      {routine.active && (
        <div className="w-1 self-stretch rounded-full bg-ll-orange shrink-0" />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-ll-white text-[13px] font-medium truncate">
          {routine.name}
        </p>
        <p className="text-ll-black-300 text-[11px] mt-0.5">
          {activeDays} días · {exerciseCount} ejercicios
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {!routine.active && (
          <button
            onClick={handleSetActive}
            disabled={isPending}
            className="font-anton uppercase text-ll-black-300 hover:text-ll-orange text-[11px] transition-colors disabled:opacity-40"
          >
            Activar
          </button>
        )}
        {routine.active && (
          <span className="font-anton uppercase text-ll-orange text-[10px] tracking-wider">
            Activa
          </span>
        )}
        <Link
          href={`/routines/${routine._id}`}
          className="font-anton uppercase text-ll-black-300 hover:text-ll-white text-[11px] transition-colors"
        >
          Editar
        </Link>
        <button
          onClick={handleDelete}
          disabled={isPending || routine.active}
          className="font-anton uppercase text-ll-black-300 hover:text-red-400 text-[11px] transition-colors disabled:opacity-40"
        >
          Borrar
        </button>
      </div>
    </div>
  )
}
