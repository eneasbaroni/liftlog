import { connectDB } from '@/lib/db/mongoose'
import PushSubscription from '@/lib/db/models/PushSubscription'
import webpush from '@/lib/webpush'
import {
  REST_TIMER_BODY,
  REST_TIMER_ICON,
  REST_TIMER_TITLE,
  REST_TIMER_URL,
} from '@/lib/push/rest-timer-message'

export const sendPushNotifications = async (): Promise<{
  sent: number
  failed: number
}> => {
  await connectDB()

  const subscriptions =
    await PushSubscription.find().lean<
      Array<{ endpoint: string; keys: { p256dh: string; auth: string } }>
    >()

  if (!subscriptions.length) {
    return { sent: 0, failed: 0 }
  }

  const payload = JSON.stringify({
    title: REST_TIMER_TITLE,
    body: REST_TIMER_BODY,
    icon: REST_TIMER_ICON,
    url: REST_TIMER_URL,
  })

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload
      )
    )
  )

  const staleEndpoints: string[] = []

  results.forEach((result, index) => {
    if (result.status !== 'rejected') return

    const statusCode = (result.reason as { statusCode?: number })?.statusCode
    // 404/410 mean the subscription is gone; prune it to avoid stale fan-out.
    if (statusCode === 404 || statusCode === 410) {
      staleEndpoints.push(subscriptions[index].endpoint)
    } else {
      console.error(`Push failed for subscription ${index}:`, result.reason)
    }
  })

  if (staleEndpoints.length) {
    await PushSubscription.deleteMany({ endpoint: { $in: staleEndpoints } })
  }

  const failed = results.filter((r) => r.status === 'rejected').length

  return { sent: subscriptions.length - failed, failed }
}
