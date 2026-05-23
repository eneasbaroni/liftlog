import { ISessionSet, ProgressPoint } from '@/lib/types'

/**
 * Estimated 1RM using the Epley formula.
 * Most accurate for reps between 1 and 10.
 */
export function calc1RM(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

/**
 * Volume for a single set: weight × reps
 */
export function setVolume(weight: number, reps: number): number {
  return weight * reps
}

/**
 * Total volume for an exercise across all its sets
 */
export function exerciseVolume(sets: ISessionSet[]): number {
  return sets.reduce((acc, s) => acc + setVolume(s.weight, s.repsCompleted), 0)
}

/**
 * Heaviest weight used across a group of sets
 */
export function maxWeight(sets: ISessionSet[]): number {
  if (!sets.length) return 0
  return Math.max(...sets.map((s) => s.weight))
}

/**
 * Builds a ProgressPoint for a given session's sets of one exercise.
 * This is what feeds the progress charts.
 */
export function buildProgressPoint(
  date: Date,
  sets: ISessionSet[]
): ProgressPoint {
  const best = sets.reduce(
    (prev, s) => {
      const estimated = calc1RM(s.weight, s.repsCompleted)
      return estimated > prev.estimated
        ? { estimated, weight: s.weight, reps: s.repsCompleted }
        : prev
    },
    { estimated: 0, weight: 0, reps: 0 }
  )

  return {
    date: date.toISOString(),
    maxWeight: maxWeight(sets),
    totalVolume: exerciseVolume(sets),
    estimated1RM: Math.round(best.estimated * 10) / 10,
  }
}

/**
 * Simple deload detection — every 4th week
 */
export function isDeloadWeek(weekNumber: number): boolean {
  return weekNumber % 4 === 0
}
