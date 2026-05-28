import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import PushSchedule from '@/lib/db/models/PushSchedule'

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

    await PushSchedule.findByIdAndUpdate(body.scheduleId, { cancelled: true })

    return NextResponse.json({ success: true })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to cancel notification'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
