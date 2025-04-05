import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { tempo } from "tempo-devtools/dist/vite";

export default defineConfig({
  plugins: [react(), tempo()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
    proxy: {
      '/api/bedrock': {
        target: 'https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/bedrock',
        changeOrigin: true,
        rewrite: (path) => '',
        secure: false,
      },
    },
  },
});
