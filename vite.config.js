/* eslint-disable no-undef */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const base = env.VITE_DEV === "True" ? "" : "/static/frontend";

  return {
    base: base,
    plugins: [react()],
    server: {
      proxy: {
        // the proxy only happens in development, because
        // django is handling the requests and gets /api to it
        '/api': {
          target: "http://127.0.0.1:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
