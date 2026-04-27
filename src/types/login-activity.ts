export interface LoginActivity {
  id: string;
  deviceType: "desktop" | "mobile" | "tablet";
  deviceName: string;
  browser: string;
  ipAddress: string;
  location: string;
  timestamp: string;
  status: "success" | "failed";
}
