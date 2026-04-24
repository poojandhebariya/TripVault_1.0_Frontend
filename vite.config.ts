import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [react(), tailwindcss(), nodePolyfills()],
  optimizeDeps: {
    // bad-words is CommonJS — tell Vite to pre-bundle it as ESM.
    // nsfwjs + tfjs are also pre-bundled to avoid chunking issues.
    include: ["bad-words", "nsfwjs", "@tensorflow/tfjs"],
  },
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

