import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/anthropic/messages': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/v1/messages',
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            const apiKey = process.env.ANTHROPIC_API_KEY
            if (!apiKey) {
              return
            }
            proxyReq.setHeader('x-api-key', apiKey)
            proxyReq.setHeader('anthropic-version', '2023-06-01')
          })
        },
      },
    },
  },
})
