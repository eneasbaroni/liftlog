import type { Metadata } from 'next'
import { Anton } from 'next/font/google'
import './globals.css'

const anton = Anton({
  variable: '--font-anton',
  weight: '400',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${anton.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
