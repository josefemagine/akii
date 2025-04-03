import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { tempo } from "tempo-devtools/dist/vite";
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tempo(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Increase the warning limit to suppress warnings about large chunks
    // Our main bundle is around 1100kb so we set this higher
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      // Exclude unused/transitional files from build to prevent errors
      external: [
        /supabase\/auth-helpers-nextjs/,
        /SimpleAuthContext\.tsx$/
      ],
      output: {
        manualChunks: {
          // Group React and related packages
          'vendor-react': [
            'react',
            'react-dom',
            'react-router-dom',
            'framer-motion',
          ],
          // Group UI components
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-switch',
            '@floating-ui/react',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-separator'
          ],
          // Group utility libraries
          'vendor-utils': [
            'date-fns',
            'recharts',
            'zod',
            'zustand',
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'lucide-react'
          ],
          // Group Supabase related code
          'vendor-supabase': [
            '@supabase/supabase-js',
            '@supabase/auth-helpers-react',
            '@supabase/auth-helpers-shared'
          ]
        }
      }
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  define: {
    __WS_TOKEN__: JSON.stringify("development"),
    igIaHIU4q9G: JSON.stringify(""),
    vUzhMAVZaTg5: JSON.stringify(""),
    N: JSON.stringify(""),
    KV712XAgwaZt: JSON.stringify(""),
    JUyX_qKj5GBB: JSON.stringify(""),
    nT4N5TGIJaAs: JSON.stringify(""),
    bWpwo_: JSON.stringify(""),
    Mm8BkfYfT0kw: JSON.stringify(""),
    h: JSON.stringify(""),
    pK17mZ1I_JAT: JSON.stringify(""),
    T40Rs: JSON.stringify(""),
    vQhe_e4AHUL: JSON.stringify(""),
    fyPZ5D1qIoak: JSON.stringify(""),
    QYamNWwHnCwf: JSON.stringify(""),
    MffHQwyZu4aK: JSON.stringify(""),
    deGyyIeX8RdD: JSON.stringify(""),
    u: JSON.stringify(""),
    haBoTSSzzxa5: JSON.stringify(""),
  },
});
