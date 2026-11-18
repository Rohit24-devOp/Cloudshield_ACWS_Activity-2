import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {} // Prevents Vite from traversing to parent D:\postcss.config.mjs
  },
  server: {
    host: true,
    port: 3000
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
