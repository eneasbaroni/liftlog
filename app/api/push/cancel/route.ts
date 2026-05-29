import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import PushSchedule from '@/lib/db/models/PushSchedule'
import { getQstashClient } from '@/lib/push/qstash'

export const POST = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as { scheduleId?: string }

    if (!body.scheduleId) {
      return NextResponse.json(
        { error: 'scheduleId is required' },
        { status: 400 }
      )
    }

    await connectDB()

    const schedule = await PushSchedule.findByIdAndUpdate(
      body.scheduleId,
      { cancelled: true },
      { new: true }
    )

    // Best-effort: drop the pending QStash message so the callback never fires.
    if (schedule?.messageId) {
      const qstash = getQstashClient()
      if (qstash) {
        await qstash.messages.delete(schedule.messageId).catch((err) => {
          console.warn('Failed to delete QStash message:', err)
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to cancel notification'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
