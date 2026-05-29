import { Client } from '@upstash/qstash'

let cachedClient: Client | null = null

/**
 * QStash client for scheduling delayed HTTP callbacks.
 * Returns null when QSTASH_TOKEN is not configured (e.g. local dev),
 * so callers can fall back to an in-process timer.
 */
export const getQstashClient = (): Client | null => {
  const token = process.env.QSTASH_TOKEN
  if (!token) return null
  if (!cachedClient) cachedClient = new Client({ token })
  return cachedClient
}

/**
 * Public base URL where QStash will deliver the scheduled callback.
 * QStash runs in the cloud, so this must be reachable from the internet.
 * Returns null for localhost (QStash cannot reach it) so callers fall back
 * to the in-process timer during local development.
 */
export const getAppUrl = (): string | null => {
  const raw = process.env.APP_URL
    ? process.env.APP_URL.replace(/\/+$/, '')
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : null

  if (!raw) return null
  if (/localhost|127\.0\.0\.1|0\.0\.0\.0|\[?::1\]?/.test(raw)) return null

  return raw
}
