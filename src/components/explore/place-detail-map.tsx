import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapPin, faCamera, faUtensils, faBed } from "@fortawesome/free-solid-svg-icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { type Place } from "../../types/explore";

export const PlaceDetailMap = ({ place }: { place: Place }) => {
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const [hoveredPoi, setHoveredPoi] = React.useState<number | null>(null);

  const baseLat = place.lat || 51.505;
  const baseLng = place.lng || -0.09;

  // Generate some nearby pseudo-POIs based on the base location to showcase rich UI
  const MAP_POIS = React.useMemo(() => [
    {
      id: 1,
      name: `${place.name || "Destination"} Center`,
      type: place.type || "Landmark",
      lat: baseLat,
      lng: baseLng,
      icon: faMapPin,
      color: "bg-indigo-600",
      ring: "ring-indigo-200",
    },
    {
      id: 2,
      name: "Scenic Viewpoint",
      type: "Nature",
      lat: baseLat + 0.003,
      lng: baseLng + 0.004,
      icon: faCamera,
      color: "bg-amber-500",
      ring: "ring-amber-200",
    },
    {
      id: 3,
      name: "Local Cuisine",
      type: "Dining",
      lat: baseLat - 0.002,
      lng: baseLng + 0.005,
      icon: faUtensils,
      color: "bg-emerald-500",
      ring: "ring-emerald-200",
    },
    {
      id: 4,
      name: "Luxury Rest",
      type: "Accommodation",
      lat: baseLat - 0.004,
      lng: baseLng - 0.002,
      icon: faBed,
      color: "bg-violet-600",
      ring: "ring-violet-200",
    },
  ], [place.name, place.type, baseLat, baseLng]);

  /* ── custom Leaflet CSS ── */
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .tv-popup .leaflet-popup-content-wrapper {
        padding:0;border-radius:12px;overflow:hidden;
        box-shadow:0 10px 25px rgba(0,0,0,0.15);border:none;
      }
      .tv-popup .leaflet-popup-content { margin:0; padding: 8px 14px; width:auto!important; }
      .tv-popup .leaflet-popup-tip { display:none; }
      .leaflet-container { font-family: inherit; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  React.useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [baseLat, baseLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 },
    ).addTo(map);

    L.control
      .attribution({ position: "bottomright", prefix: false })
      .addTo(map);
    L.control.attribution().addAttribution("© OpenStreetMap, © CartoDB");
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [baseLat, baseLng]);

  // Update map center if place changes
  React.useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([baseLat, baseLng], 14);
    }
  }, [baseLat, baseLng]);

  // Add markers
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers: L.Marker[] = [];

    MAP_POIS.forEach((poi) => {
      // Create custom div icon based on generic marker style
      const hexColor = poi.color === "bg-indigo-600" ? "#4f46e5" : 
                       poi.color === "bg-amber-500" ? "#f59e0b" :
                       poi.color === "bg-emerald-500" ? "#10b981" :
                       "#7c3aed";
      
      const ringColor = poi.ring === "ring-indigo-200" ? "#c7d2fe" :
                        poi.ring === "ring-amber-200" ? "#fde68a" :
                        poi.ring === "ring-emerald-200" ? "#a7f3d0" :
                        "#ddd6fe";

      const icon = L.divIcon({
        className: "bg-transparent border-none",
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -32],
        html: `
          <div style="width:28px;height:28px;border-radius:50%;background:${hexColor};border:3px solid ${ringColor};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 6px -1px rgba(0,0,0,0.2);position:relative;">
            <div style="width:100%;height:100%;position:absolute;z-index:-1;border-radius:50%;border:2px solid ${hexColor};opacity:0.3;transform:scale(1.2);"></div>
            <span style="display:block;width:8px;height:8px;background:white;border-radius:50%;"></span>
          </div>
        `
      });

      const marker = L.marker([poi.lat, poi.lng], { icon }).addTo(map);

      marker.bindPopup(`
        <div style="text-align:center;padding:2px">
          <p style="margin:0;font-weight:bold;font-size:12px;color:#111827">${poi.name}</p>
          <p style="margin:0;font-size:10px;text-transform:uppercase;color:#6b7280;letter-spacing:0.05em;margin-top:2px;">${poi.type}</p>
        </div>
      `, {
        closeButton: false,
        className: "tv-popup"
      });

      marker.on("mouseover", () => {
        marker.openPopup();
        setHoveredPoi(poi.id);
      });
      
      marker.on("mouseout", () => {
        marker.closePopup();
        setHoveredPoi(null);
      });

      markers.push(marker);
    });

    return () => {
      markers.forEach(m => m.remove());
    };
  }, [MAP_POIS]);

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      <div>
        <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.3em] mb-1">
          Destination Map
        </p>
        <p className="text-gray-400 text-xs">
          Interactive map for {place.name || "this location"}
        </p>
      </div>

      {/* Map canvas */}
      <div className="relative h-[420px] w-full rounded-2xl overflow-hidden border border-gray-200">
        <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-gray-50" />

        {/* Badges */}
        {place.location && (
          <div className="absolute top-4 left-4 flex gap-2 z-400 pointer-events-none">
            <span className="bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {place.location}
            </span>
          </div>
        )}
      </div>

      {/* POI list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {MAP_POIS.map((poi, i) => (
          <div
            key={poi.id}
            onMouseEnter={() => {
              setHoveredPoi(poi.id);
              if (mapRef.current) {
                mapRef.current.flyTo([poi.lat, poi.lng], 16, { animate: true, duration: 0.5 });
              }
            }}
            onMouseLeave={() => setHoveredPoi(null)}
            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${hoveredPoi === poi.id ? "border-indigo-200 bg-indigo-50 shadow-sm scale-[1.02]" : "border-gray-100 bg-white hover:border-gray-200"}`}
          >
            <div
              className={`w-8 h-8 ${poi.color} rounded-xl flex items-center justify-center text-white shrink-0`}
            >
              <FontAwesomeIcon icon={poi.icon} className="text-[9px]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">
                {poi.name}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                {poi.type}
              </p>
            </div>
            <span className="text-[10px] font-bold text-gray-300 bg-gray-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
              {i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
