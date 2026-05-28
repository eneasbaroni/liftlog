import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import PushSubscription from '@/lib/db/models/PushSubscription'

type PushSubscriptionPayload = {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

export const POST = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as PushSubscriptionPayload

    if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid push subscription' },
        { status: 400 }
      )
    }

    await connectDB()

    await PushSubscription.findOneAndUpdate(
      { endpoint: body.endpoint },
      {
        endpoint: body.endpoint,
        keys: { p256dh: body.keys.p256dh, auth: body.keys.auth },
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to save subscription'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
