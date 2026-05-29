import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { connectDB } from '@/lib/db/mongoose'
import PushSchedule from '@/lib/db/models/PushSchedule'
import { sendPushNotifications } from '@/lib/push/send-notifications'

const handler = async (req: Request): Promise<Response> => {
  try {
    const { scheduleId } = (await req.json()) as { scheduleId?: string }

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'scheduleId is required' },
        { status: 400 }
      )
    }

    await connectDB()

    const current = await PushSchedule.findById(scheduleId).lean()
    if (!current || current.cancelled) {
      return NextResponse.json({ skipped: true })
    }

    const { sent, failed } = await sendPushNotifications()
    if (sent === 0 && failed === 0) {
      console.warn(`Scheduled push ${scheduleId}: no subscriptions in database`)
    }

    await PushSchedule.deleteOne({ _id: scheduleId })

    return NextResponse.json({ success: true, sent, failed })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to send scheduled push'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Lazily build the verifier so a missing signing key doesn't break `next build`.
let verified: ((req: Request) => Promise<Response>) | null = null

export const POST = async (req: Request): Promise<Response> => {
  if (!verified) {
    verified = verifySignatureAppRouter(handler)
  }
  return verified(req)
}
