import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // 🛠️ When frontend calls `/api`, forward it to backend
      '/api': {
        target: 'https://real-time-vehicle-tracking.onrender.com', // your backend server
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // remove `/api` prefix
      },
    },
  },
})
