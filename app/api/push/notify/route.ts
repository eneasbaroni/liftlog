import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { sendPushNotifications } from '@/lib/push/send-notifications'

export const POST = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as { title?: string; body?: string }

    await connectDB()

    const { sent, failed } = await sendPushNotifications(body)

    if (sent === 0 && failed === 0) {
      return NextResponse.json(
        { error: 'No subscriptions found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, sent, failed })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to send notification'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
