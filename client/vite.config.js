import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      includeManifestInSW: false, // Set false agar tidak bertabrakan dengan precache Workbox
      workbox: {
        // Jangan masukkan manifest ke dalam sistem precache Workbox yang memicu error 404
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'SwasanaKebaya',
        short_name: 'Swasana',
        description: 'Menghidupkan kembali tradisi melalui busana yang penuh makna dan cerita.',
        theme_color: '#0c0a09', 
        background_color: '#0c0a09',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})