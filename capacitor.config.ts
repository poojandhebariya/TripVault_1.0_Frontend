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
  plugins: {
    SplashScreen: {
      // Keep native splash visible until we manually call SplashScreen.hide()
      launchAutoHide: false,
      // Background colour matches our light gradient
      backgroundColor: "#E6EBF9",
      androidSplashResourceName: "splash",
      showSpinner: false,
      // Smooth fade-out when we dismiss it
      fadeOutDuration: 300,
    },
  },
};

export default config;
