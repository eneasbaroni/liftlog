'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ProgressPoint } from '@/lib/types'
import { ProgressChartProps, ChartMetric } from './types'
import { ProgressStats } from '../ProgressStats/ProgressStats'

const METRICS: Array<{ value: ChartMetric; label: string }> = [
  { value: 'maxWeight', label: 'Peso máx.' },
  { value: 'estimated1RM', label: '1RM est.' },
  { value: 'totalVolume', label: 'Volumen' },
]

const formatDate = (iso: string): string => {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

const formatValue = (metric: ChartMetric, raw: number): string => {
  if (metric === 'totalVolume') return `${(raw / 1000).toFixed(1)}t`
  return `${raw}kg`
}

const toChartValue = (metric: ChartMetric, point: ProgressPoint): number => {
  if (metric === 'totalVolume') return Math.round(point.totalVolume / 10) / 100
  return point[metric]
}

export const ProgressChart = ({
  exerciseId,
  exerciseName,
}: ProgressChartProps) => {
  const [points, setPoints] = useState<ProgressPoint[]>([])
  const [metric, setMetric] = useState<ChartMetric>('maxWeight')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/progress/${exerciseId}`)
        if (res.ok) {
          const data = (await res.json()) as ProgressPoint[]
          setPoints(data)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgress()
  }, [exerciseId])

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-ll-black-300 text-[12px]">Cargando...</p>
      </div>
    )
  }

  if (points.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-ll-black-300 text-[12px]">
          Completá sesiones para ver tu progreso
        </p>
      </div>
    )
  }

  const chartData = points.map((p) => ({
    date: formatDate(p.date),
    value: toChartValue(metric, p),
  }))

  const tooltipFormatter = (value: unknown): [string, string] => {
    const num = typeof value === 'number' ? value : 0
    const raw = metric === 'totalVolume' ? num * 1000 : num
    return [formatValue(metric, raw), exerciseName]
  }

  return (
    <div className="flex flex-col gap-4">
      <ProgressStats points={points} />

      {/* Metric selector */}
      <div className="flex gap-[3px]">
        {METRICS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMetric(m.value)}
            className={[
              'flex-1 py-2 rounded-[8px] text-[11px] transition-colors',
              metric === m.value
                ? 'bg-ll-orange text-ll-white'
                : 'bg-ll-black-600 text-ll-black-300 hover:bg-ll-black-orange hover:text-ll-white',
            ].join(' ')}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-ll-black-600 rounded-[10px] p-4">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fill: '#5A5852', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#5A5852', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#2C2A26',
                border: 'none',
                borderRadius: 8,
                color: '#F0EDE8',
                fontSize: 12,
              }}
              formatter={tooltipFormatter}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#E05C1A"
              strokeWidth={2}
              dot={{ fill: '#E05C1A', r: 3, strokeWidth: 0 }}
              activeDot={{ fill: '#F0EDE8', r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
