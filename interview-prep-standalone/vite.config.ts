import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // Exposes the port to Render
    allowedHosts: true, // Prevents the DNS block/Blocked request error
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
  },
  preview: {
    host: true,
    allowedHosts: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
  }
})