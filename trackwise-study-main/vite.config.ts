import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  root: ".",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html"
      }
    }
  }
}));
