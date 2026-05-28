import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPushSchedule extends Document {
  notifyAt: Date
  cancelled: boolean
  createdAt: Date
}

const PushScheduleSchema = new Schema<IPushSchedule>(
  {
    notifyAt: { type: Date, required: true, index: true },
    cancelled: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const PushSchedule: Model<IPushSchedule> =
  mongoose.models.PushSchedule ||
  mongoose.model<IPushSchedule>('PushSchedule', PushScheduleSchema)

export default PushSchedule
