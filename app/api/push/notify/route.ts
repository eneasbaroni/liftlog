import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import PushSubscription from '@/lib/db/models/PushSubscription'
import webpush from '@/lib/webpush'

export const POST = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as { title?: string; body?: string }

    await connectDB()

    const subscriptions =
      await PushSubscription.find().lean<
        Array<{ endpoint: string; keys: { p256dh: string; auth: string } }>
      >()

    if (!subscriptions.length) {
      return NextResponse.json(
        { error: 'No subscriptions found' },
        { status: 404 }
      )
    }

    const payload = JSON.stringify({
      title: body.title ?? 'Liftlog — ¡A entrenar!',
      body: body.body ?? 'El descanso terminó. Es hora de la siguiente serie.',
      icon: '/icons/icon-192.png',
      url: '/week',
    })

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        )
      )
    )

    const failed = results.filter((r) => r.status === 'rejected')
    if (failed.length) {
      console.warn(`${failed.length} push(es) failed`)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to send notification'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
