'use client'

import { useState, useTransition } from 'react'
import {
  addExerciseToDay,
  removeExerciseFromDay,
  updateExerciseInDay,
} from '@/app/actions/routines.actions'
import { WeekDay } from '@/lib/constants'
import { RoutineDayEditorProps } from './types'

export const RoutineDayEditor = ({
  routineId,
  day,
  exercises,
  availableExercises,
}: RoutineDayEditorProps) => {
  const [isPending, startTransition] = useTransition()
  const [showPicker, setShowPicker] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editWeight, setEditWeight] = useState<number>(0)

  const handleAdd = (exerciseId: string) => {
    const ex = availableExercises.find((e) => e._id === exerciseId)
    if (!ex) return

    startTransition(async () => {
      await addExerciseToDay(routineId, day as WeekDay, {
        exerciseId,
        order: exercises.length,
        sets: ex.defaultSets,
        reps: ex.defaultReps,
        targetWeight: ex.defaultWeight,
      })
      setShowPicker(false)
    })
  }

  const handleRemove = (exerciseId: string) => {
    startTransition(async () => {
      await removeExerciseFromDay(routineId, day as WeekDay, exerciseId)
    })
  }

  const handleUpdateWeight = (exerciseId: string) => {
    startTransition(async () => {
      await updateExerciseInDay(routineId, day as WeekDay, exerciseId, {
        targetWeight: editWeight,
      })
      setEditingId(null)
    })
  }

  const addedIds = new Set(exercises.map((e) => e.exerciseId))
  const available = availableExercises.filter((e) => !addedIds.has(e._id))

  return (
    <div className="flex flex-col gap-[3px]">
      {/* Exercise list */}
      {exercises.length === 0 && (
        <div className="bg-ll-black-600 rounded-[10px] px-3 py-6 text-center">
          <p className="text-ll-black-300 text-[12px]">
            No hay ejercicios para este día.
          </p>
        </div>
      )}

      {exercises.map((ex) => (
        <div
          key={ex.exerciseId}
          className="bg-ll-black-600 rounded-[10px] p-3 flex items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <p className="text-ll-white text-[13px] font-medium truncate">
              {ex.name}
            </p>
            <p className="text-ll-black-300 text-[10px] mt-0.5">
              {ex.sets} series · {ex.reps} reps
            </p>
          </div>

          {/* Weight editor */}
          {editingId === ex.exerciseId ? (
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min={0}
                step={0.5}
                value={editWeight}
                onChange={(e) => setEditWeight(Number(e.target.value))}
                className="w-16 bg-ll-black-900 text-ll-white text-[13px] rounded-[6px] px-2 py-1 border border-ll-orange focus:outline-none"
              />
              <button
                onClick={() => handleUpdateWeight(ex.exerciseId)}
                disabled={isPending}
                className="text-ll-orange text-[11px] disabled:opacity-40"
              >
                OK
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="text-ll-black-300 text-[11px]"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  setEditingId(ex.exerciseId)
                  setEditWeight(ex.targetWeight)
                }}
                className="text-right"
              >
                <p className="text-ll-orange text-[15px] leading-none">
                  {ex.targetWeight}
                  <span className="text-ll-black-300 text-[10px] ml-0.5">
                    kg
                  </span>
                </p>
              </button>
              <button
                onClick={() => handleRemove(ex.exerciseId)}
                disabled={isPending}
                className="text-ll-black-300 hover:text-red-400 text-[13px] transition-colors disabled:opacity-40"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add exercise */}
      {!showPicker ? (
        <button
          onClick={() => setShowPicker(true)}
          className="bg-ll-orange font-anton uppercase hover:bg-ll-black-orange rounded-[10px] px-3 py-3 flex items-center justify-center gap-1.5 transition-colors"
        >
          <span className="text-ll-white text-[11px]">+ Agregar ejercicio</span>
        </button>
      ) : (
        <div className="bg-ll-black-600 rounded-[10px] p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-ll-black-200 text-[10px] uppercase tracking-wider">
              Seleccioná un ejercicio
            </p>
            <button
              onClick={() => setShowPicker(false)}
              className="text-ll-black-300 text-[13px]"
            >
              ✕
            </button>
          </div>
          {available.length === 0 ? (
            <p className="text-ll-black-300 text-[12px] text-center py-2">
              Todos los ejercicios ya fueron agregados.
            </p>
          ) : (
            <div className="flex flex-col gap-[3px] max-h-48 overflow-y-auto">
              {available.map((ex) => (
                <button
                  key={ex._id}
                  onClick={() => handleAdd(ex._id)}
                  disabled={isPending}
                  className="text-left px-3 py-2.5 rounded-lg bg-ll-black-900 hover:bg-ll-black-orange transition-colors disabled:opacity-40"
                >
                  <p className="text-ll-white text-[12px]">{ex.name}</p>
                  <p className="text-ll-black-300 text-[10px] mt-0.5">
                    {ex.defaultSets} × {ex.defaultReps} · {ex.defaultWeight} kg
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
