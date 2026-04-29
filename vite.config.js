import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('firebase/messaging') || id.includes('/@firebase/messaging')) {
            return 'firebase-messaging'
          }

          if (id.includes('firebase/auth') || id.includes('/@firebase/auth')) {
            return 'firebase-auth'
          }

          if (id.includes('firebase/database') || id.includes('/@firebase/database')) {
            return 'firebase-db'
          }

          if (
            id.includes('firebase/app') ||
            id.includes('/@firebase/app') ||
            id.includes('/@firebase/component') ||
            id.includes('/@firebase/util') ||
            id.includes('/idb/')
          ) {
            return 'firebase-core'
          }

          if (
            id.includes('/node_modules/vue/') ||
            id.includes('/node_modules/@vue/')
          ) {
            return 'vue-core'
          }

          if (id.includes('/node_modules/vue-router/')) return 'vue-router'
          if (id.includes('/node_modules/pinia/')) return 'pinia'
          if (id.includes('/node_modules/canvas-confetti/')) return 'ui-effects'
        },
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Plantão',
        short_name: 'Plantão',
        description: 'Sistema de anotações de enfermagem',
        theme_color: '#0A1628',
        background_color: '#0A1628',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // firebase-messaging-sw.js importado via importScripts — não precachear
        globIgnores: ['firebase-messaging-sw.js'],
        importScripts: ['/firebase-messaging-sw.js'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache' }
          }
        ]
      }
    })
  ]
})
