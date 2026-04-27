export interface Session {
  id: string;
  deviceType: "desktop" | "mobile" | "tablet";
  deviceName: string;
  browser: string;
  platform: string;
  ipAddress: string;
  lastActive: string;
  current: boolean;
}
