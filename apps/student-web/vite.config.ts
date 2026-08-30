import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const proxy = {
  "/v1": {
    target: "http://127.0.0.1:3000",
    changeOrigin: false,
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4174,
    proxy,
  },
  preview: {
    host: "127.0.0.1",
    port: 5174,
    strictPort: true,
    proxy,
  },
});
