import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tempo()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      // Exclude unused/transitional files from build to prevent errors
      // These files are part of the authentication refactoring
      // and will be removed in a future update
      external: [
        /ConsolidatedAuthContext\.tsx$/,
        /AuthContext\.tsx\.new\.tsx$/,
        /SimpleAuthContext\.tsx$/
      ],
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
