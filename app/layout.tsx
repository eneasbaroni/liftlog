import type { Metadata } from 'next'
import { Anton, Google_Sans_Flex } from 'next/font/google'
import './globals.css'
import { BottomNav } from '@/components'
import { headers } from 'next/headers'

const anton = Anton({
  variable: '--font-anton',
  weight: '400',
  subsets: ['latin'],
})

const googleSansFlex = Google_Sans_Flex({
  variable: '--font-google-sans-flex',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'LiftLog',
  description: 'LiftLog is a tool for tracking your lifts',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? '/week'
  return (
    <html
      lang="en"
      className={`${anton.variable} ${googleSansFlex.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}

        <BottomNav activePath={pathname} />
      </body>
    </html>
  )
}
