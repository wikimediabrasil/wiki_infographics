/* eslint-disable no-undef */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (`development`, `production`, etc.)
  const env = loadEnv(mode, process.cwd())

  return {
    base: '/static/frontend/',
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: `${env.VITE_API_BASE_URL}:${env.VITE_API_PORT}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
