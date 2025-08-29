import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on current mode (development, production, etc.)
  // FIX: Replaced process.cwd() with path.resolve() to resolve a TypeScript error where the 'Process' type lacks the 'cwd' property.
  const env = loadEnv(mode, path.resolve(), '')

  return {
    plugins: [react()],
    define: {
      // Make env vars available to client (must start with VITE_)
      // FIX: Ensure only the primary VITE_GEMINI_API_KEY is defined here.
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
    server: {
      port: 5173,
      open: true,
    },
  }
})
