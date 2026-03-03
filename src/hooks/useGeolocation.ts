import { useEffect, useState, useRef, useCallback } from "react";

export type PermissionState =
  | "prompt"
  | "granted"
  | "denied"
  | "unavailable"
  | "disabled";

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface UseGeolocationResult {
  location: GeoLocation | null;
  permissionState: PermissionState;
  /** Re-trigger the permission request (e.g. user clicked a button) */
  requestPermission: () => void;
}

const useGeolocation = (): UseGeolocationResult => {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [permissionState, setPermissionState] =
    useState<PermissionState>("prompt");
  const watchIdRef = useRef<number | null>(null);

  const isCapacitor =
    typeof window !== "undefined" &&
    !!(window as any).Capacitor?.isNativePlatform?.();

  const updateLocation = (pos: {
    coords: { latitude: number; longitude: number };
  }) => {
    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    setPermissionState("granted");
  };

  const handleError = (err: any) => {
    const msg = err.message?.toLowerCase() || "";
    // User denied permission
    if (err.code === 1 || msg.includes("denied")) {
      setPermissionState("denied");
    }
    // GPS / Device Location Services are turned OFF
    else if (
      msg.includes("enabled") ||
      msg.includes("services") ||
      msg.includes("disabled")
    ) {
      setPermissionState("disabled");
    } else {
      setPermissionState("unavailable");
    }
    console.warn("Geolocation error:", err);
  };

  const requestPermission = useCallback(async () => {
    console.log("Requesting location permission... isCapacitor:", isCapacitor);

    if (isCapacitor) {
      try {
        const { Geolocation } = await import("@capacitor/geolocation");

        // Step 1: Request permissions
        const perm = await Geolocation.requestPermissions({
          permissions: ["location", "coarseLocation"],
        });
        console.log("Permission request result:", perm);

        if (perm.location === "granted") {
          setPermissionState("granted");

          // Step 2: Try to get current position
          // This might also trigger the "System-wide GPS on" dialog on some Android versions
          try {
            const pos = await Geolocation.getCurrentPosition({
              enableHighAccuracy: true,
              timeout: 10000, // 10s
            });
            updateLocation(pos);

            // Step 3: Start watching if coords found
            if (watchIdRef.current !== null) {
              Geolocation.clearWatch({ id: String(watchIdRef.current) });
            }
            const id = await Geolocation.watchPosition(
              { enableHighAccuracy: true },
              (p) => p && updateLocation(p),
            );
            watchIdRef.current = Number(id);
          } catch (posErr: any) {
            console.error("Position fetch failed:", posErr);
            const msg = posErr.message?.toLowerCase() || "";
            if (msg.includes("enabled") || msg.includes("services")) {
              setPermissionState("disabled");
            }
          }
        } else {
          setPermissionState("denied");
        }
      } catch (err: any) {
        console.error("Capacitor requestPermissions failed:", err);
        const msg = err.message?.toLowerCase() || "";
        if (msg.includes("enabled") || msg.includes("services")) {
          setPermissionState("disabled");
        } else {
          // Fallback to web
          navigator.geolocation.getCurrentPosition(
            updateLocation,
            handleError,
            {
              enableHighAccuracy: true,
              timeout: 10000,
            },
          );
        }
      }
    } else {
      // Browser
      if (!("geolocation" in navigator)) {
        setPermissionState("unavailable");
        return;
      }

      navigator.geolocation.getCurrentPosition(updateLocation, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      // Browser Watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = navigator.geolocation.watchPosition(
        updateLocation,
        () => {},
        { enableHighAccuracy: true },
      );
    }
  }, [isCapacitor]);

  const checkStatus = useCallback(async () => {
    if (isCapacitor) {
      try {
        const { Geolocation } = await import("@capacitor/geolocation");
        const perm = await Geolocation.checkPermissions();
        if (perm.location === "granted") {
          setPermissionState("granted");
          // Try to get location silently
          try {
            const pos = await Geolocation.getCurrentPosition({
              enableHighAccuracy: true,
              timeout: 5000,
            });
            updateLocation(pos);
          } catch {
            /* fail silently, wait for user interact */
          }
        } else if (perm.location === "denied") {
          setPermissionState("denied");
        } else {
          setPermissionState("prompt");
        }
      } catch {
        setPermissionState("prompt");
      }
    } else if ("permissions" in navigator) {
      try {
        const result = await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });
        const map: Record<string, PermissionState> = {
          granted: "granted",
          denied: "denied",
          prompt: "prompt",
        };
        setPermissionState(map[result.state] || "prompt");
        result.onchange = () => {
          setPermissionState(map[result.state] || "prompt");
        };
      } catch {
        setPermissionState("prompt");
      }
    }
  }, [isCapacitor]);

  useEffect(() => {
    checkStatus();
    return () => {
      if (watchIdRef.current !== null) {
        if (isCapacitor) {
          import("@capacitor/geolocation").then(({ Geolocation }) => {
            Geolocation.clearWatch({ id: String(watchIdRef.current) });
          });
        } else {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
      }
    };
  }, [checkStatus, isCapacitor]);

  return { location, permissionState, requestPermission };
};

export default useGeolocation;
