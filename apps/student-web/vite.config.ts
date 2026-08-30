import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiTarget = env.VITE_API_PROXY_TARGET || "http://127.0.0.1:3000";
  const proxy = {
    "/v1": {
      target: apiTarget,
      changeOrigin: false,
    },
  };

  return {
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
  };
});
