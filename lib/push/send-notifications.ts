import PushSubscription from '@/lib/db/models/PushSubscription'
import webpush from '@/lib/webpush'

export type PushMessage = {
  title?: string
  body?: string
  url?: string
}

export const sendPushNotifications = async (
  message: PushMessage = {}
): Promise<{ sent: number; failed: number }> => {
  const subscriptions =
    await PushSubscription.find().lean<
      Array<{ endpoint: string; keys: { p256dh: string; auth: string } }>
    >()

  if (!subscriptions.length) {
    return { sent: 0, failed: 0 }
  }

  const payload = JSON.stringify({
    title: message.title ?? 'Liftlog — ¡A entrenar!',
    body: message.body ?? 'El descanso terminó. Es hora de la siguiente serie.',
    icon: '/icons/icon-192.png',
    url: message.url ?? '/week',
  })

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload
      )
    )
  )

  const failed = results.filter((r) => r.status === 'rejected').length
  if (failed) {
    console.warn(`${failed} push(es) failed`)
  }

  return { sent: subscriptions.length - failed, failed }
}
