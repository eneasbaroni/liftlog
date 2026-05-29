// components/AdaptiveIcon.tsx
'use client'

import { useEffect } from 'react'

export function AdaptiveIcon() {
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    document
      .querySelectorAll('link[rel="apple-touch-icon"]')
      .forEach((el) => el.remove())

    const link = document.createElement('link')
    link.rel = 'apple-touch-icon'
    link.href = isDark ? '/icons/icon-192.png' : '/icons/icon-192.png'
    document.head.appendChild(link)
  }, [])

  return null
}
