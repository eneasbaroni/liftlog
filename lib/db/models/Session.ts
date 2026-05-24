import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { WeekDay } from '@/lib/constants'

export type SessionStatus = 'pending' | 'in_progress' | 'completed'

// A single completed set — most granular record, feeds the progress charts
export interface ISessionSet {
  setNumber: number
  repsCompleted: number
  weight: number // kg actually used
  rir?: number // Reps In Reserve: how many reps left in the tank
  rpe?: number // Rate of Perceived Exertion: 1–10 scale
  notes?: string
  completedAt: Date
}

// One exercise within a session, containing all its sets
export interface ISessionExercise {
  exerciseId: Types.ObjectId
  name: string // Denormalized — keeps history intact if exercise is renamed/deleted
  order: number
  sets: ISessionSet[]
  notes?: string
  targetSets: number
}

export interface ISession extends Document {
  routineId: Types.ObjectId
  day: WeekDay
  date: Date
  status: SessionStatus
  exercises: ISessionExercise[]
  startedAt?: Date
  completedAt?: Date
  durationMin?: number // Calculated on completion
  generalNotes?: string
  createdAt: Date
  updatedAt: Date
}

const SessionSetSchema = new Schema<ISessionSet>(
  {
    setNumber: { type: Number, required: true },
    repsCompleted: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0 },
    rir: { type: Number, min: 0, max: 10 },
    rpe: { type: Number, min: 1, max: 10 },
    notes: { type: String, trim: true },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const SessionExerciseSchema = new Schema<ISessionExercise>(
  {
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    order: { type: Number, required: true, default: 0 },
    sets: [SessionSetSchema],
    notes: { type: String, trim: true },
    targetSets: { type: Number, required: true, default: 3 },
  },
  { _id: false }
)

const SessionSchema = new Schema<ISession>(
  {
    routineId: {
      type: Schema.Types.ObjectId,
      ref: 'Routine',
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    exercises: [SessionExerciseSchema],
    startedAt: Date,
    completedAt: Date,
    durationMin: { type: Number, min: 0 },
    generalNotes: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
)

// Indexes for the most frequent queries
SessionSchema.index({ date: -1 }) // History ordered by date
SessionSchema.index({ 'exercises.exerciseId': 1, date: 1 }) // Progress by exercise

const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema)

export default Session
