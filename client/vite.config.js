import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'QueueFlow Clinic Manager',
        short_name: 'QueueFlow',
        description: 'Smart Queue Management System',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          },
          {
            src: 'icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
