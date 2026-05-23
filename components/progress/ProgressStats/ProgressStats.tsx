import { ProgressPoint } from '@/lib/types'
import { ProgressStatsProps } from './types'

const getBest = (points: ProgressPoint[], key: keyof ProgressPoint): number => {
  if (!points.length) return 0
  return Math.max(...points.map((p) => p[key] as number))
}

const getLatest = (
  points: ProgressPoint[],
  key: keyof ProgressPoint
): number => {
  if (!points.length) return 0
  return points[points.length - 1][key] as number
}

const getTrend = (
  points: ProgressPoint[],
  key: keyof ProgressPoint
): number => {
  if (points.length < 2) return 0
  const last = points[points.length - 1][key] as number
  const prev = points[points.length - 2][key] as number
  return Math.round(((last - prev) / prev) * 100)
}

export const ProgressStats = ({ points }: ProgressStatsProps) => {
  const trend = getTrend(points, 'maxWeight')

  const stats: Array<{
    label: string
    value: number
    unit: string
    highlight?: boolean
  }> = [
    {
      label: 'Mejor peso',
      value: getBest(points, 'maxWeight'),
      unit: 'kg',
      highlight: true,
    },
    {
      label: '1RM estimado',
      value: getBest(points, 'estimated1RM'),
      unit: 'kg',
    },
    {
      label: 'Último volumen',
      value: Math.round((getLatest(points, 'totalVolume') / 1000) * 10) / 10,
      unit: 't',
    },
  ]

  return (
    <div className="flex flex-col gap-[3px]">
      <div className="grid grid-cols-3 gap-[3px]">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-ll-black-600 rounded-[10px] p-3">
            <p className="text-ll-black-300 text-[9px] uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <p className="leading-none">
              <span
                className={`text-[22px] ${stat.highlight ? 'text-ll-orange' : 'text-ll-white'}`}
              >
                {stat.value}
              </span>
              <span className="text-ll-black-300 text-[10px] ml-0.5">
                {stat.unit}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Trend indicator */}
      {points.length >= 2 && (
        <div className="bg-ll-black-600 rounded-[10px] px-4 py-3 flex items-center justify-between">
          <p className="text-ll-black-300 text-[11px]">
            Tendencia última sesión
          </p>
          <p
            className={`text-[13px] font-medium ${trend >= 0 ? 'text-ll-orange' : 'text-ll-black-300'}`}
          >
            {trend >= 0 ? '+' : ''}
            {trend}%
          </p>
        </div>
      )}
    </div>
  )
}
