'use client'

import { useNotification } from '@/hooks/useNotification'

export const NotificationBanner = () => {
  const { isSubscribed, isSupported, subscribe } = useNotification()

  if (!isSupported || isSubscribed) return null

  return (
    <div className="bg-ll-black-600 rounded-[10px] px-4 py-3 flex items-center justify-between">
      <p className="text-ll-black-200 text-[11px]">
        Activá notificaciones para el timer
      </p>
      <button
        type="button"
        onClick={subscribe}
        className="bg-ll-orange text-ll-white text-[11px] rounded-[6px] px-3 py-1.5 hover:opacity-90 transition-opacity"
      >
        Activar
      </button>
    </div>
  )
}
