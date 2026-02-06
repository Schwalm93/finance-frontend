import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Lauscht auf alle Netzwerk-Schnittstellen
    port: 5173,      // Beibehaltung des Ports
    watch: {
      usePolling: true
    }
  }
})