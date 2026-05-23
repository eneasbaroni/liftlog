import type { MetadataRoute } from 'next'

const manifest = (): MetadataRoute.Manifest => {
  return {
    name: 'Liftlog',
    short_name: 'Liftlog',
    description: 'Tu diario de entrenamiento personal',
    start_url: '/week',
    display: 'standalone',
    background_color: '#0F0F0F',
    theme_color: '#0F0F0F',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}

export default manifest
