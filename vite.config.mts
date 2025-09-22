import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({ 
  plugins: [react()], 
  base: '/', 
  build: { 
    outDir: 'dist', 
    chunkSizeWarningLimit: 1600, 
  },
  server: {
    port: 5173, // Default port
    strictPort: false, // Allow Vite to find next available port if 5173 is busy
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
