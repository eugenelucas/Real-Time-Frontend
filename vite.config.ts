import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',         // <-- Add this line for relative paths to assets
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Bind to all available network interfaces
    port: 5173,       // Default port, change if necessary
  },
})