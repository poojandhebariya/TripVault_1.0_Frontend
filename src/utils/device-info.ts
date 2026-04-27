// Capacitor injects these globals when running in a native app
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
      getPlatform: () => string; // 'web' | 'ios' | 'android'
    };
  }
}

export type DeviceType = "desktop" | "mobile" | "tablet";
export type Platform = "web" | "ios" | "android";

export interface DeviceInfo {
  deviceType: DeviceType;
  deviceName: string;
  browser: string;
  platform: Platform;
}

export const getDeviceInfo = (): DeviceInfo => {
  const ua = navigator.userAgent;

  // ── Platform (Capacitor native vs web browser) ──────────────────────────────
  let platform: Platform = "web";
  const cap = window.Capacitor;
  if (cap?.isNativePlatform?.()) {
    const p = cap.getPlatform();
    platform = p === "ios" ? "ios" : "android";
  }

  // ── Device type ──────────────────────────────────────────────────────────────
  let deviceType: DeviceType = "desktop";
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = "tablet";
  } else if (
    /mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|windows phone/i.test(ua)
  ) {
    deviceType = "mobile";
  }

  // ── Device name ──────────────────────────────────────────────────────────────
  let deviceName = "Unknown Device";
  if (platform === "ios") {
    deviceName = /ipad/i.test(ua) ? "iPad" : "iPhone";
  } else if (platform === "android") {
    const match = ua.match(/Android[^;]*;\s([^)]+)\)/);
    deviceName = match ? match[1].trim() : "Android Device";
  } else {
    // Web browser — use Macintosh (not "Mac OS X") because iPhone UA contains "like Mac OS X"
    if (/Windows NT 10|Windows NT 11/i.test(ua)) deviceName = "Windows 10/11 PC";
    else if (/Windows NT/i.test(ua)) deviceName = "Windows PC";
    else if (/Macintosh/i.test(ua)) deviceName = "Mac"; // Macintosh never appears in mobile UAs
    else if (/Linux/i.test(ua) && deviceType === "desktop") deviceName = "Linux PC";
    else if (deviceType === "mobile") deviceName = "Mobile Device";
    else if (deviceType === "tablet") deviceName = "Tablet";
    else deviceName = "PC";
  }

  // ── Browser ──────────────────────────────────────────────────────────────────
  let browser = "Unknown Browser";
  if (platform !== "web") {
    browser = "TripVault App";
  } else if (/Edg\//i.test(ua)) {
    const v = ua.match(/Edg\/(\d+)/)?.[1] ?? "";
    browser = `Edge ${v}`.trim();
  } else if (/OPR\//i.test(ua)) {
    const v = ua.match(/OPR\/(\d+)/)?.[1] ?? "";
    browser = `Opera ${v}`.trim();
  } else if (/Chrome\/(\d+)/i.test(ua)) {
    const v = ua.match(/Chrome\/(\d+)/)?.[1] ?? "";
    browser = `Chrome ${v}`.trim();
  } else if (/Firefox\/(\d+)/i.test(ua)) {
    const v = ua.match(/Firefox\/(\d+)/)?.[1] ?? "";
    browser = `Firefox ${v}`.trim();
  } else if (/Safari\//i.test(ua)) {
    const v = ua.match(/Version\/(\d+)/)?.[1] ?? "";
    browser = `Safari ${v}`.trim();
  }

  return { deviceType, deviceName, browser, platform };
};
