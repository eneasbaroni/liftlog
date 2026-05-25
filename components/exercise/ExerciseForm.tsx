'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MUSCLE_GROUPS } from '@/lib/types'
import { createExercise, updateExercise } from '@/app/actions/exercises.actions'
import { MUSCLE_GROUP_LABELS, MuscleGroup } from '@/lib/constants'
import { ExerciseFormProps, FormState } from './types'

const inputClass = [
  'w-full bg-ll-black-600 text-ll-white rounded-lg px-3 py-2.5 text-sm bg-ll-black-orange',
  'border border-transparent focus:border-ll-orange focus:outline-none transition-colors',
  'placeholder:text-ll-black-300',
].join(' ')

const labelClass =
  'block text-ll-black-200 text-[10px] uppercase tracking-wider mb-1.5'

export const ExerciseForm = ({ exercise, onSuccess }: ExerciseFormProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    name: exercise?.name ?? '',
    description: exercise?.description ?? '',
    muscleGroup: (exercise?.muscleGroup as MuscleGroup) ?? 'chest',
    defaultSets: exercise?.defaultSets ?? 3,
    defaultReps: exercise?.defaultReps ?? 10,
    defaultWeight: exercise?.defaultWeight ?? 0,
  })

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    setError(null)

    if (!form.name.trim()) {
      setError('El nombre es obligatorio.')
      return
    }

    startTransition(async () => {
      const result = exercise
        ? await updateExercise(exercise._id, form)
        : await createExercise(form)

      if (!result.success) {
        setError(result.error)
        return
      }

      onSuccess?.()
      router.push('/exercises')
    })
  }

  return (
    <div className="flex flex-col gap-4 font-google-sans-flex">
      {/* Name */}
      <div>
        <label className={labelClass}>Nombre</label>
        <input
          className={inputClass}
          placeholder="Press banca"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>
          Descripción <span className="text-ll-black-300">(opcional)</span>
        </label>
        <textarea
          className={`${inputClass} resize-none h-20`}
          placeholder="Técnica, notas de ejecución..."
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      {/* Muscle group */}
      <div>
        <label className={labelClass}>Grupo muscular</label>
        <div className="grid grid-cols-3 gap-0.5">
          {MUSCLE_GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => set('muscleGroup', g)}
              className={[
                'py-2 rounded-md text-xs transition-colors',
                form.muscleGroup === g
                  ? 'bg-ll-orange text-black'
                  : 'mise-glass text-ll-black-200 hover:text-ll-white',
              ].join(' ')}
            >
              {MUSCLE_GROUP_LABELS[g]}
            </button>
          ))}
        </div>
      </div>

      {/* Sets / Reps / Weight */}
      <div className="grid grid-cols-3 gap-0.5">
        <div>
          <label className={labelClass}>Series</label>
          <input
            type="number"
            min={1}
            className={inputClass}
            value={form.defaultSets}
            onChange={(e) => set('defaultSets', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>Reps</label>
          <input
            type="number"
            min={1}
            className={inputClass}
            value={form.defaultReps}
            onChange={(e) => set('defaultReps', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>Peso (kg)</label>
          <input
            type="number"
            min={0}
            step={0.5}
            className={inputClass}
            value={form.defaultWeight}
            onChange={(e) => set('defaultWeight', Number(e.target.value))}
          />
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-ll-orange text-xs">{error}</p>}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full bg-ll-orange text-white rounded-lg py-3 text-sm uppercase font-anton! font-normal transition-opacity disabled:opacity-50"
      >
        {isPending
          ? 'Guardando...'
          : exercise
            ? 'Guardar cambios'
            : 'Crear ejercicio'}
      </button>
    </div>
  )
}
