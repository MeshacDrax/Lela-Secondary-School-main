import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [react()],
  server: {
    allowedHosts: ["localhost", "127.0.0.1", ".loca.lt"],
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
        rewrite: (path) => path
      },
      "/health": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
});
