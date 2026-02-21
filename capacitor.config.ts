import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.tripvault",
  appName: "TripVault",
  webDir: "dist",
  server: {
    url: "https://txslthn5-5173.inc1.devtunnels.ms",
    cleartext: true,
    androidScheme: "https",
  },
};

export default config;
