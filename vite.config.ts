import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all /admin/ requests to the backend API
      '/admin': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
      },
      // Proxy news/insights requests
      '/real-estate-news': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
