import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, SESSION_COOKIE_NAME } from '@/lib/auth'
import { BottomNav } from '@/components'

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  // ── Auth guard ───────────────────────────────────────────────────────────
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token || !(await verifyToken(token))) {
    redirect('/login')
  }

  // ── Active path for BottomNav ────────────────────────────────────────────
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? '/week'

  return (
    <div className="min-h-screen bg-ll-black-900">
      <main>{children}</main>
      <BottomNav activePath={pathname} />
    </div>
  )
}

export default DashboardLayout
