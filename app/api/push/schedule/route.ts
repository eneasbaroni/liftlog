import { NextRequest, NextResponse, after } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import PushSchedule from '@/lib/db/models/PushSchedule'
import { sendPushNotifications } from '@/lib/push/send-notifications'
import { sleep } from '@/lib/push/sleep'

/** Max rest timer delay the server will wait for (10 minutes). */
const MAX_DELAY_MS = 10 * 60 * 1000

export const maxDuration = 300

export const POST = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as {
      endsAt?: number
      title?: string
      body?: string
    }

    if (!body.endsAt || typeof body.endsAt !== 'number') {
      return NextResponse.json({ error: 'endsAt is required' }, { status: 400 })
    }

    const delayMs = body.endsAt - Date.now()

    if (delayMs > MAX_DELAY_MS) {
      return NextResponse.json(
        { error: 'Timer exceeds maximum schedulable duration' },
        { status: 400 }
      )
    }

    await connectDB()

    const schedule = await PushSchedule.create({
      notifyAt: new Date(body.endsAt),
      cancelled: false,
      title: body.title,
      body: body.body,
    })

    const scheduleId = schedule._id.toString()

    after(async () => {
      if (delayMs > 0) {
        await sleep(delayMs)
      }

      const current = await PushSchedule.findById(scheduleId).lean()
      if (!current || current.cancelled) return

      await sendPushNotifications({
        title: current.title,
        body: current.body,
      })

      await PushSchedule.deleteOne({ _id: scheduleId })
    })

    return NextResponse.json({ success: true, scheduleId })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to schedule notification'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
