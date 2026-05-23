import Link from 'next/link'
import { WEEK_DAY_LABELS } from '@/lib/constants'
import { WeekDay } from '@/lib/constants'
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
  const volume = calcVolume(session)
  const totalSets = calcTotalSets(session)
  const dayLabel = WEEK_DAY_LABELS[session.day as WeekDay] ?? session.day

  return (
    <Link href={`/history/${session._id}`} className="block group">
      <div className="bg-ll-black-600 hover:bg-ll-black-orange rounded-[10px] p-4 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-ll-white text-[14px] font-medium">{dayLabel}</p>
            <p className="text-ll-black-300 text-[11px] mt-0.5">
              {formatDate(session.date)}
            </p>
          </div>
          {session.durationMin && (
            <p className="text-ll-black-300 text-[11px]">
              {session.durationMin} min
            </p>
          )}
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
