import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import sitemap from "vite-plugin-sitemap";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: "globalThis",
    process: {
      env: {},
    },
    Buffer: ["buffer", "Buffer"],
    "process.env.__REACT_ROUTER_V7_FUTURE_FLAG_startTransition": "true",
    "process.env.__REACT_ROUTER_V7_FUTURE_FLAG_relativeSplatPath": "true",
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer/",
      stream: "stream-browserify",
      process: "process/browser",
      http: "stream-http",
      https: "https-browserify",
      url: "url/",
      zlib: "browserify-zlib",
      events: "events/",
      assert: "assert/",
      crypto: "crypto-browserify",
      path: "path-browserify",
      os: "os-browserify/browser",
      punycode: "punycode/",
      util: path.resolve(__dirname, "src/lib/util-polyfill.ts"),
    },
    mainFields: ["browser", "module", "main"],
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "@supabase/supabase-js",
      "@radix-ui/react-slot",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "buffer",
      "process",
      "events",
      "stream-browserify",
      "path-browserify",
      "crypto-browserify",
    ],
    exclude: ["src/components/layout/DashboardLayout.tsx"],
  },
  build: {
    sourcemap: true,
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    modulePreload: {
      polyfill: true,
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
      defaultIsModuleExports: "auto",
    },
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
      output: {
        format: "es",
        assetFileNames: (assetInfo) => {
          // Preserve favicon.ico at the root
          if (assetInfo.name === "favicon.ico") {
            return "favicon.ico";
          }
          return "assets/[name].[hash].[ext]";
        },
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "motion-vendor": ["framer-motion"],
          "supabase-vendor": ["@supabase/supabase-js"],
          "ui-core": ["@radix-ui/react-slot"],
          "ui-dialog": ["@radix-ui/react-dialog"],
          "ui-dropdown": ["@radix-ui/react-dropdown-menu"],
        },
      },
    },
    target: "esnext",
    minify: false,
  },
  plugins: [
    react(),
    tempo(),
    sitemap({
      hostname: "https://akii.com",
      dynamicRoutes: [
        "/",
        "/products/web-chat-agent",
        "/products/mobile-chat-agent",
        "/products/whatsapp-chat-agent",
        "/products/telegram-chat-agent",
        "/products/shopify-chat-agent",
        "/products/wordpress-chat-agent",
        "/products/private-ai-api",
        "/pricing",
        "/contact",
        "/blog",
        "/terms-of-service",
        "/privacy-policy",
      ],
      exclude: ["/dashboard/**", "/admin/**", "/auth/**", "/tempobook/**"],
      outDir: "dist",
    }),
  ],

  server: {
    port: 3000,
    fs: {
      strict: false,
    },
    hmr: true,
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  esbuild: false,
});
