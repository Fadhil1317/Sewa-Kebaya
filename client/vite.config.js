import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Bersih total dari import VitePWA
export default defineConfig({
  plugins: [react()],
})