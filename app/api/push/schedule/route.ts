import { NextRequest, NextResponse, after } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import PushSchedule from '@/lib/db/models/PushSchedule'
import { runScheduledPush } from '@/lib/push/run-scheduled-push'
import { getAppUrl, getQstashClient } from '@/lib/push/qstash'

/** Max rest timer delay the server will wait for (10 minutes). */
const MAX_DELAY_MS = 10 * 60 * 1000

export const POST = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as { endsAt?: number }

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
    })

    const scheduleId = schedule._id.toString()

    const qstash = getQstashClient()
    const appUrl = getAppUrl()

    // Preferred path: QStash fires an exact HTTP callback even if the app is
    // closed/frozen. Works on serverless where holding a function open fails.
    if (qstash && appUrl) {
      const delaySeconds = Math.max(0, Math.ceil(delayMs / 1000))
      const { messageId } = await qstash.publishJSON({
        url: `${appUrl}/api/push/send`,
        body: { scheduleId },
        delay: delaySeconds,
      })
      await PushSchedule.updateOne({ _id: scheduleId }, { messageId })
    } else {
      // Fallback for local dev (QStash can't reach localhost): in-process timer.
      if (process.env.NODE_ENV !== 'development') {
        console.warn(
          'QStash not configured (QSTASH_TOKEN / APP_URL). Falling back to in-process timer, which is unreliable on serverless.'
        )
      }
      const run = () => runScheduledPush(scheduleId, delayMs)
      if (process.env.NODE_ENV === 'development') {
        void run()
      } else {
        after(run)
      }
    }

    return NextResponse.json({ success: true, scheduleId })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to schedule notification'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
