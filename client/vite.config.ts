import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:5000 (proxy)'

  return {
    plugins: [
      react(),
      {
        name: 'startup-info',
        configureServer(server) {
          server.httpServer?.once('listening', () => {
            console.log(`\n  API target : ${apiUrl}`)
          })
        },
      },
    ],
    server: {
      proxy: {
        '/api': env.VITE_API_URL ? env.VITE_API_URL : 'http://localhost:5000',
      },
    },
  }
})
