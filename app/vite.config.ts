import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [react(), mkcert()],
  // Para evitar problemas de tipos en build, https en dev no es necesario
  server: { host: true }
})