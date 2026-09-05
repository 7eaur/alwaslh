import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  base: mode === "preview-single" ? "/admin/" : "/",
  plugins: [react()],
  server: {
    port: 4173,
  },
  preview: {
    port: 5173,
  },
}));
