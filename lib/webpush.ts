import webpush from 'web-push'

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_EMAIL = process.env.VAPID_EMAIL

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_EMAIL) {
  throw new Error('Missing VAPID environment variables')
}

const vapidSubject = VAPID_EMAIL.startsWith('mailto:')
  ? VAPID_EMAIL
  : `mailto:${VAPID_EMAIL}`

webpush.setVapidDetails(vapidSubject, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

export default webpush
