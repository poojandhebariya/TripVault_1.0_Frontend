import L from "leaflet";
import {
  faLock,
  faUserGroup,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";

export const makeMarker = (color: string, ringColor: string) =>
  L.divIcon({
    className: "",
    iconAnchor: [16, 40],
    popupAnchor: [0, -42],
    html: `
      <div style="
        width:32px;height:40px;display:flex;flex-direction:column;
        align-items:center;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));
      ">
        <div style="
          width:28px;height:28px;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background:${color};
          border:3px solid ${ringColor};
          display:flex;align-items:center;justify-content:center;
        ">
          <div style="
            width:10px;height:10px;border-radius:50%;
            background:white;opacity:0.9;transform:rotate(45deg);
          "></div>
        </div>
        <div style="
          width:4px;height:12px;
          background:linear-gradient(to bottom,${color},transparent);
          border-radius:0 0 4px 4px;margin-top:-2px;
        "></div>
      </div>`,
  });

export const vaultMarker = makeMarker("#6366f1", "#4338ca");
export const bucketMarker = makeMarker("#f59e0b", "#d97706");

export const priorityConfig = {
  HIGH: {
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  MEDIUM: {
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  LOW: {
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
} as Record<string, { color: string; bg: string; border: string; dot: string }>;

export const visibilityIcon = (v: string) => {
  if (v === "private") return faLock;
  if (v === "friends") return faUserGroup;
  return faGlobe;
};
