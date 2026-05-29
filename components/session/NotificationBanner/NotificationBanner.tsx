'use client'

import { useEffect, useState } from 'react'
import { useNotification } from '@/providers/NotificationProvider'

export const NotificationBanner = () => {
  const { isSubscribed, isSupported, subscribe } = useNotification()
  const [permission, setPermission] =
    useState<NotificationPermission>('default')

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission)
    }
  }, [isSubscribed])

  if (!isSupported || isSubscribed) return null

  const denied = permission === 'denied'

  return (
    <div className="bg-ll-black-600 rounded-[10px] px-4 py-3 flex items-center justify-between gap-3">
      <p className="text-ll-black-200 text-[11px]">
        {denied
          ? 'Notificaciones bloqueadas. Habilitalas en ajustes del navegador.'
          : 'Activá notificaciones para el timer'}
      </p>
      {!denied && (
        <button
          type="button"
          onClick={subscribe}
          className="bg-ll-orange text-ll-white text-[11px] rounded-[6px] px-3 py-1.5 shrink-0 hover:opacity-90 transition-opacity"
        >
          Activar
        </button>
      )}
    </div>
  )
}
