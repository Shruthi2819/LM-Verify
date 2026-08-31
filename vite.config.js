import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/LM-Verify/',
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    host: true, // Listen on 0.0.0.0 so phone on LAN can access verification gateway
    port: 5175,
  },
})
