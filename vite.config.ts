import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { tempo } from "tempo-devtools/dist/vite";
import tsconfigPaths from 'vite-tsconfig-paths'

// Check if we're doing a focused build for Bedrock API testing
const isFocusedBedrockBuild = process.env.FOCUS_BEDROCK === "true";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tempo(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Use a different entry point for focused Bedrock builds
  build: isFocusedBedrockBuild ? {
    // Simplified build configuration for Bedrock API testing
    outDir: 'dist-bedrock',
    lib: {
      entry: path.resolve(__dirname, 'src/bedrock-entry.ts'),
      name: 'BedrockApi',
      fileName: (format) => `bedrock.${format}.js`
    },
    // Skip minification for easier debugging
    minify: false,
    sourcemap: true
  } : {
    // Standard build configuration
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      // Exclude unused/transitional files from build to prevent errors
      external: [
        /supabase\/auth-helpers-nextjs/,
        /SimpleAuthContext\.tsx$/,
        /ConsolidatedAuthContext\.tsx$/ // Exclude the problematic auth context file
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
    proxy: {
      '/api/super-action': {
        target: 'http://localhost:54321/functions/v1/super-action',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/super-action/, ''),
      },
      // Additional proxy configurations can be added here as needed
    }
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
  // Add preview configuration for SPA routing
  preview: {
    port: 4173,
    // Add headers to allow React Router to work properly
    headers: {
      'Cache-Control': 'no-store',
    },
  },
});
