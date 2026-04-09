import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Setoranku',
        short_name: 'Setoran',
        description: 'Aplikasi pencatat keuangan pribadi v1.2.4',
        theme_color: '#7c3aed',
        background_color: '#05080f',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
