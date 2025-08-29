
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on current mode (development, production, etc.)
  // FIX: Replaced process.cwd() with path.resolve() to avoid potential TypeScript type errors with the global 'process' object.
  const env = loadEnv(mode, path.resolve(), '')

  return {
    plugins: [react()],
    define: {
      // Make env vars available to client (must start with VITE_)
      'process.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
    server: {
      port: 5173,
      open: true,
    },
  }
})