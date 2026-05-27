'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { WEEK_DAY_LABELS } from '@/lib/constants'
import { WeekDay } from '@/lib/constants'
import { deleteSession } from '@/app/actions/sessions.actions'
import { SessionCardProps } from './types'

const formatDate = (iso: string): string => {
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const calcVolume = (session: SessionCardProps['session']): number =>
  session.exercises.reduce(
    (acc, e) =>
      acc + e.sets.reduce((sAcc, s) => sAcc + s.weight * s.repsCompleted, 0),
    0
  )

const calcTotalSets = (session: SessionCardProps['session']): number =>
  session.exercises.reduce((acc, e) => acc + e.sets.length, 0)

export const SessionCard = ({ session }: SessionCardProps) => {
  const [isPending, startTransition] = useTransition()
  const volume = calcVolume(session)
  const totalSets = calcTotalSets(session)
  const dayLabel = WEEK_DAY_LABELS[session.day as WeekDay] ?? session.day
  const isInProgress = session.status === 'in_progress'

  const href = isInProgress
    ? `/session/${session._id}`
    : `/history/${session._id}`

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('¿Eliminar esta sesión?')) return
    startTransition(async () => {
      await deleteSession(session._id)
    })
  }

  return (
    <Link href={href} className="block group">
      <div
        className={[
          'rounded-[10px] p-4 transition-colors',
          isInProgress
            ? 'bg-ll-black-orange hover:bg-ll-black-600 border border-ll-orange'
            : 'bg-ll-black-600 hover:bg-ll-black-orange',
          isPending ? 'opacity-50' : '',
        ].join(' ')}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-ll-white text-[14px] font-medium">
                {dayLabel}
              </p>
              {isInProgress && (
                <span className="bg-ll-orange text-ll-white text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                  En curso
                </span>
              )}
            </div>
            <p className="text-ll-black-300 text-[11px]">
              {formatDate(session.date)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {session.durationMin && (
              <p className="text-ll-black-300 text-[11px]">
                {session.durationMin} min
              </p>
            )}
            {isInProgress && (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-ll-white font-anton uppercase bg-ll-orange px-2 rounded-full hover:text-red-400 text-[13px] transition-colors disabled:opacity-40"
                aria-label="Eliminar sesión"
              >
                ELIMINAR
              </button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-4">
          <div>
            <p className="text-ll-orange text-[16px] leading-none">
              {(volume / 1000).toFixed(1)}
              <span className="text-ll-black-300 text-[10px] ml-0.5">t</span>
            </p>
            <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mt-0.5">
              volumen
            </p>
          </div>
          <div>
            <p className="text-ll-white text-[16px] leading-none">
              {totalSets}
              <span className="text-ll-black-300 text-[10px] ml-0.5">
                series
              </span>
            </p>
            <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mt-0.5">
              total
            </p>
          </div>
          <div>
            <p className="text-ll-white text-[16px] leading-none">
              {session.exercises.length}
              <span className="text-ll-black-300 text-[10px] ml-0.5">ej</span>
            </p>
            <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mt-0.5">
              ejercicios
            </p>
          </div>
        </div>

        {/* Exercise names */}
        <p className="text-ll-black-300 text-[11px] mt-3 truncate">
          {session.exercises.map((e) => e.name).join(' · ')}
        </p>
      </div>
    </Link>
  )
}
