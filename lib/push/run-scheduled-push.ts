import { connectDB } from '@/lib/db/mongoose'
import PushSchedule from '@/lib/db/models/PushSchedule'
import { sendPushNotifications } from '@/lib/push/send-notifications'
import { sleep } from '@/lib/push/sleep'

export const runScheduledPush = async (
  scheduleId: string,
  delayMs: number
): Promise<void> => {
  try {
    if (delayMs > 0) {
      await sleep(delayMs)
    }

    await connectDB()

    const current = await PushSchedule.findById(scheduleId).lean()
    if (!current || current.cancelled) return

    const { sent, failed } = await sendPushNotifications()

    if (sent === 0 && failed === 0) {
      console.warn(`Scheduled push ${scheduleId}: no subscriptions in database`)
    }

    await PushSchedule.deleteOne({ _id: scheduleId })
  } catch (err) {
    console.error(`Scheduled push ${scheduleId} failed:`, err)
  }
}
