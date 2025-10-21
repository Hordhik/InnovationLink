import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],

  server: {
    // Keep dev server stable under heavy file changes by ignoring sibling folders
    watch: {
      ignored: [
        '**/node_modules/**',
        '../Back-end/**',
        '../Front-End/**',
        '../botbackend/**',
        '../**/*.log',
      ],
    },

    // Restrict file serving scope to this project only
    fs: { allow: ['.'] },

    // ✅ In development, don't use CSP headers (to allow Vite React Fast Refresh)
    headers:
      mode === 'production'
        ? {
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
          ].join('; '),
        }
        : undefined,
  },
}))