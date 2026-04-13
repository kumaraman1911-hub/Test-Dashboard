import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/Test-Dashboard/' : '/',
  server: {
    host: '0.0.0.0',
    allowedHosts: 'all',
  },
})
