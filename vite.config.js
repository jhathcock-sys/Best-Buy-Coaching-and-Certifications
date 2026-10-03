import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    babel: {
      plugins: [['babel-plugin-react-compiler', {}]],
    },
  }),
  {
    name: 'serve-manifest',
    configureServer(server) {
      server.middlewares.use('/loop_manifest.json', (req, res, next) => {
        // Only intercept precise exact matches, letting the rest fall through
        if (req.url === '/' || req.url === '' || req.url.startsWith('/?') || req.url.startsWith('?')) {
          const manifestPath = path.resolve(__dirname, 'agent_memory/loop_manifest.json');
          if (fs.existsSync(manifestPath)) {
            res.setHeader('Content-Type', 'application/json');
            // Disable caching so the browser always gets the latest file
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.end(fs.readFileSync(manifestPath));
            return;
          }
        }
        next();
      });
    }
  }],
  server: {
    allowedHosts: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['tests/**', '**/node_modules/**']
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@firebase/firestore') || id.includes('firebase/firestore')) {
              return 'vendor-firestore';
            }
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'vendor-firebase-core';
            }
            if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
              return 'vendor-motion';
            }
            if (id.includes('@dnd-kit')) {
              return 'vendor-dnd';
            }
            if (id.includes('react-markdown') || id.includes('micromark') || id.includes('dompurify') || id.includes('unist') || id.includes('vfile') || id.includes('mdast') || id.includes('decode-named-character-reference')) {
              return 'vendor-markdown';
            }
            if (id.includes('@google/generative-ai') || id.includes('@google/genai')) {
              return 'vendor-gemini';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('zod')) {
              return 'vendor-zod';
            }
            if (id.includes('papaparse')) {
              return 'vendor-papaparse';
            }
            return 'vendor-misc';
          }
        }
      }
    }
  }
})


