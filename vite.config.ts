import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/nominatim": {
        target: "https://nominatim.openstreetmap.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nominatim/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            // Nominatim requires a valid User-Agent — browsers can't set this header,
            // so the Vite proxy injects it server-side
            proxyReq.setHeader(
              "User-Agent",
              "TripVault/1.0 (https://github.com/tripvault; contact@tripvault.app)",
            );
            proxyReq.setHeader(
              "Referer",
              "https://nominatim.openstreetmap.org/",
            );
          });
        },
      },
    },
  },
});
