import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    babel: {
      plugins: [['babel-plugin-react-compiler', {}]],
    },
  })],
  server: {
    allowedHosts: true
  },
  test: {
    globals: true,
    environment: 'node',
    exclude: ['tests/**', '**/node_modules/**']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('@google/generative-ai')) {
              return 'vendor-gemini';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})


