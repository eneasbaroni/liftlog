import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { WEEK_DAYS } from '@/lib/types'
import { WeekDay } from '@/lib/constants'

export interface IRoutineExercise {
  exerciseId: Types.ObjectId
  order: number
  sets: number
  reps: number
  targetWeight: number
  restSeconds?: number
  notes?: string
}

export interface IRoutine extends Document {
  name: string
  active: boolean
  days: Map<WeekDay, IRoutineExercise[]>
  createdAt: Date
  updatedAt: Date
}

const RoutineExerciseSchema = new Schema<IRoutineExercise>(
  {
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    order: { type: Number, required: true, default: 0 },
    sets: { type: Number, required: true, min: 1 },
    reps: { type: Number, required: true, min: 1 },
    targetWeight: { type: Number, required: true, min: 0 },
    restSeconds: { type: Number, min: 0 },
    notes: { type: String, trim: true },
  },
  { _id: false }
)

const RoutineSchema = new Schema<IRoutine>(
  {
    name: { type: String, required: true, trim: true },
    active: { type: Boolean, default: false },
    days: {
      type: Map,
      of: [RoutineExerciseSchema],
      default: () => new Map(),
      validate: {
        validator: (map: Map<string, IRoutineExercise[]>) =>
          [...map.keys()].every((k) =>
            (WEEK_DAYS as readonly string[]).includes(k)
          ),
        message: 'Invalid week day key',
      },
    },
  },
  { timestamps: true }
)

RoutineSchema.index({ active: 1 }, { sparse: true })

const Routine: Model<IRoutine> =
  mongoose.models.Routine || mongoose.model<IRoutine>('Routine', RoutineSchema)

export default Routine
