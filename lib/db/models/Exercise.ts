import mongoose, { Schema, Document, Model } from 'mongoose'
import { MUSCLE_GROUPS } from '@/lib/types'
import { MuscleGroup } from '@/lib/constants'

export interface IExercise extends Document {
  name: string
  description?: string
  muscleGroup: MuscleGroup
  defaultSets: number
  defaultReps: number
  defaultWeight: number
  createdAt: Date
  updatedAt: Date
}

const ExerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    muscleGroup: { type: String, enum: MUSCLE_GROUPS, required: true },
    defaultSets: { type: Number, required: true, min: 1, default: 3 },
    defaultReps: { type: Number, required: true, min: 1, default: 10 },
    defaultWeight: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
)

ExerciseSchema.index({ name: 'text' })
ExerciseSchema.index({ muscleGroup: 1 })

const Exercise: Model<IExercise> =
  mongoose.models.Exercise ||
  mongoose.model<IExercise>('Exercise', ExerciseSchema)

export default Exercise
