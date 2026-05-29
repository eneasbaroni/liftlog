import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPushSchedule extends Document {
  cancelled: boolean
  messageId?: string
  createdAt: Date
}

const PushScheduleSchema = new Schema<IPushSchedule>(
  {
    cancelled: { type: Boolean, default: false },
    messageId: { type: String },
  },
  { timestamps: true }
)

const PushSchedule: Model<IPushSchedule> =
  mongoose.models.PushSchedule ||
  mongoose.model<IPushSchedule>('PushSchedule', PushScheduleSchema)

export default PushSchedule
