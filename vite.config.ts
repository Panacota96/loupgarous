import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.VITE_PUBLIC_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react()],
})
