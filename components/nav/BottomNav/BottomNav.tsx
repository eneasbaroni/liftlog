'use client'

import Link from 'next/link'
import { BottomNavProps, NavItem } from './types'

const NAV_ITEMS: NavItem[] = [
  {
    href: '/week',
    label: 'Semana',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    href: '/exercises',
    label: 'Ejercicios',
    icon: 'M 3 12 h 20 M 6 8 v 8 M 9 6 v 12 M 17 6 v 12 M 20 8 v 8',
  },
  {
    href: '/history',
    label: 'Historial',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    href: '/progress',
    label: 'Progreso',
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  },
]

export const BottomNav = ({ activePath }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-ll-black-900 border-t border-ll-black-600 flex items-stretch z-50">
      {NAV_ITEMS.map((item) => {
        const isActive = activePath.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors',
              isActive
                ? 'text-ll-orange'
                : 'text-ll-black-300 hover:text-ll-white',
            ].join(' ')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={item.icon}
              />
            </svg>
            <span className="text-[9px] uppercase tracking-wider">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
