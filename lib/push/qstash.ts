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
 */
export const getAppUrl = (): string | null => {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return null
}
