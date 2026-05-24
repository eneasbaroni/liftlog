'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  addExerciseToDay,
  removeExerciseFromDay,
  updateExerciseInDay,
  reorderDayExercises,
} from '@/app/actions/routines.actions'
import { WeekDay } from '@/lib/constants'
import { RoutineDayEditorProps, RoutineExerciseRow } from './types'

// ── Sortable row ─────────────────────────────────────────────────────────────

type SortableExerciseRowProps = {
  ex: RoutineExerciseRow
  isPending: boolean
  editingId: string | null
  editWeight: number
  onEditStart: (id: string, weight: number) => void
  onEditWeightChange: (weight: number) => void
  onEditConfirm: (id: string) => void
  onEditCancel: () => void
  onRemove: (id: string) => void
}

const SortableExerciseRow = ({
  ex,
  isPending,
  editingId,
  editWeight,
  onEditStart,
  onEditWeightChange,
  onEditConfirm,
  onEditCancel,
  onRemove,
}: SortableExerciseRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ex.exerciseId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-ll-black-600 rounded-[10px] p-3 flex items-center gap-3"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-ll-black-300 hover:text-ll-white transition-colors cursor-grab active:cursor-grabbing shrink-0 touch-none"
        aria-label="Arrastrar para reordenar"
      >
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
          <circle cx="5" cy="4" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="11" cy="4" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="11" cy="12" r="1.5" />
        </svg>
      </button>

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
            onChange={(e) => onEditWeightChange(Number(e.target.value))}
            className="w-16 bg-ll-black-900 text-ll-white text-[13px] rounded-[6px] px-2 py-1 border border-ll-orange focus:outline-none"
          />
          <button
            onClick={() => onEditConfirm(ex.exerciseId)}
            disabled={isPending}
            className="text-ll-orange text-[11px] disabled:opacity-40"
          >
            OK
          </button>
          <button
            onClick={onEditCancel}
            className="text-ll-black-300 text-[11px]"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onEditStart(ex.exerciseId, ex.targetWeight)}
            className="text-right"
          >
            <p className="text-ll-orange text-[15px] leading-none">
              {ex.targetWeight}
              <span className="text-ll-black-300 text-[10px] ml-0.5">kg</span>
            </p>
          </button>
          <button
            onClick={() => onRemove(ex.exerciseId)}
            disabled={isPending}
            className="text-ll-black-300 hover:text-red-400 text-[13px] transition-colors disabled:opacity-40"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export const RoutineDayEditor = ({
  routineId,
  day,
  exercises,
  availableExercises,
}: RoutineDayEditorProps) => {
  const [isPending, startTransition] = useTransition()
  const [localExercises, setLocalExercises] =
    useState<RoutineExerciseRow[]>(exercises)
  const [showPicker, setShowPicker] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editWeight, setEditWeight] = useState<number>(0)

  useEffect(() => {
    setLocalExercises(exercises)
  }, [exercises])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = localExercises.findIndex((e) => e.exerciseId === active.id)
    const newIndex = localExercises.findIndex((e) => e.exerciseId === over.id)
    const reordered = arrayMove(localExercises, oldIndex, newIndex)

    setLocalExercises(reordered)

    startTransition(async () => {
      await reorderDayExercises(
        routineId,
        day as WeekDay,
        reordered.map((e) => e.exerciseId)
      )
    })
  }

  const handleAdd = (exerciseId: string) => {
    const ex = availableExercises.find((e) => e._id === exerciseId)
    if (!ex) return

    startTransition(async () => {
      await addExerciseToDay(routineId, day as WeekDay, {
        exerciseId,
        order: localExercises.length,
        sets: ex.defaultSets,
        reps: ex.defaultReps,
        targetWeight: ex.defaultWeight,
      })
      setShowPicker(false)
    })
  }

  const handleRemove = (exerciseId: string) => {
    setLocalExercises((prev) => prev.filter((e) => e.exerciseId !== exerciseId))
    startTransition(async () => {
      await removeExerciseFromDay(routineId, day as WeekDay, exerciseId)
    })
  }

  const handleUpdateWeight = (exerciseId: string) => {
    setLocalExercises((prev) =>
      prev.map((e) =>
        e.exerciseId === exerciseId ? { ...e, targetWeight: editWeight } : e
      )
    )
    startTransition(async () => {
      await updateExerciseInDay(routineId, day as WeekDay, exerciseId, {
        targetWeight: editWeight,
      })
      setEditingId(null)
    })
  }

  const addedIds = new Set(localExercises.map((e) => e.exerciseId))
  const available = availableExercises.filter((e) => !addedIds.has(e._id))

  return (
    <div className="flex flex-col gap-[3px]">
      {localExercises.length === 0 && (
        <div className="bg-ll-black-600 rounded-[10px] px-3 py-6 text-center">
          <p className="text-ll-black-300 text-[12px]">
            No hay ejercicios para este día.
          </p>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localExercises.map((e) => e.exerciseId)}
          strategy={verticalListSortingStrategy}
        >
          {localExercises.map((ex) => (
            <SortableExerciseRow
              key={ex.exerciseId}
              ex={ex}
              isPending={isPending}
              editingId={editingId}
              editWeight={editWeight}
              onEditStart={(id, weight) => {
                setEditingId(id)
                setEditWeight(weight)
              }}
              onEditWeightChange={setEditWeight}
              onEditConfirm={handleUpdateWeight}
              onEditCancel={() => setEditingId(null)}
              onRemove={handleRemove}
            />
          ))}
        </SortableContext>
      </DndContext>

      {!showPicker ? (
        <button
          onClick={() => setShowPicker(true)}
          className="bg-ll-orange hover:opacity-90 rounded-[10px] px-3 py-3 flex items-center justify-center transition-opacity"
        >
          <span className="text-ll-white text-[11px] uppercase tracking-wider">
            + Agregar ejercicio
          </span>
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
