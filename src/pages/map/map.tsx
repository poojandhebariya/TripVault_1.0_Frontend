import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { vaultQueries } from "../../tanstack/vault/queries";
import { bucketListQueries } from "../../tanstack/bucket-list/queries";
import { useUserContext } from "../../contexts/user/user";
import type { Vault } from "../../types/vault";
import type { BucketList } from "../../types/bucket-list";
import useIsMobile from "../../hooks/isMobile";

// Sub-components
import MapStatsBar from "../../components/map/map-stats-bar";
import MapLegend from "../../components/map/map-legend";
import VaultDetailCard from "../../components/map/vault-detail-card";
import BucketDetailCard from "../../components/map/bucket-detail-card";
import BucketListPanel from "../../components/map/bucket-list-panel";
import { vaultMarker, bucketMarker } from "../../components/map/map-constants";

/* ── fix Leaflet default icon path broken by bundlers ── */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useUserContext();
  const isMobile = useIsMobile();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // panel state
  const [activePanel, setActivePanel] = useState<"none" | "bucket">("none");
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<BucketList | null>(null);
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [hoveredBucketId, setHoveredBucketId] = useState<number | null>(null);
  const bucketMarkersRef = useRef<Map<number, L.Marker>>(new Map());

  /* ── queries ── */
  const { getMyVaults } = vaultQueries();
  const { getBucketList, getStats } = bucketListQueries();

  const { data: myVaults = [] } = useQuery({
    ...getMyVaults(),
    enabled: isLoggedIn,
  });

  const { data: bucketData } = useQuery({
    ...getBucketList(1, "priority", "desc"),
    enabled: isLoggedIn,
  });

  const { data: stats } = useQuery({
    ...getStats(),
    enabled: isLoggedIn,
  });

  const bucketItems: BucketList[] = bucketData?.data ?? [];
  const filteredBucket = useMemo(
    () =>
      priorityFilter === "ALL"
        ? bucketItems
        : bucketItems.filter((b) => b.priority === priorityFilter),
    [bucketItems, priorityFilter],
  );

  const locatedVaults = useMemo(
    () =>
      (myVaults as Vault[]).filter((v) => v.location?.lat && v.location?.lon),
    [myVaults],
  );

  /* ── init map ── */
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
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
  }, []);

  /* ── vault markers ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers: L.Marker[] = [];

    locatedVaults.forEach((vault) => {
      const lat = vault.location!.lat;
      const lon = vault.location!.lon;

      const marker = L.marker([lat, lon], { icon: vaultMarker }).addTo(map);

      if (!isMobile) {
        marker.bindTooltip(
          `<div style="font-weight:700;font-size:13px;color:#1e1b4b">${vault.title}</div>
           <div style="font-size:11px;color:#6b7280;margin-top:2px">${vault.location?.label ?? ""}</div>`,
          { direction: "top", offset: [0, -44] },
        );
      }

      marker.on("click", () => {
        setSelectedVault(vault);
        setSelectedBucket(null);
        map.flyTo([lat, lon], Math.max(map.getZoom(), 8), {
          animate: true,
          duration: 0.8,
        });
      });

      markers.push(marker);
    });

    return () => markers.forEach((m) => m.remove());
  }, [locatedVaults.length, isMobile]);

  /* ── bucket markers ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    bucketMarkersRef.current.forEach((m) => m.remove());
    bucketMarkersRef.current.clear();

    bucketItems.forEach((item) => {
      const vault = item.vault;
      if (!vault || !vault.location?.lat || !vault.location?.lon) return;
      const lat = vault.location.lat;
      const lon = vault.location.lon;

      const marker = L.marker([lat, lon], { icon: bucketMarker }).addTo(map);

      if (!isMobile) {
        marker.bindTooltip(
          `<div style="font-weight:700;font-size:12px;color:#92400e">🎯 ${vault.title}</div>
           <div style="font-size:10px;color:#6b7280">${item.priority} · ${item.targetYear}</div>`,
          { direction: "top", offset: [0, -44] },
        );
      }

      marker.on("click", () => {
        setSelectedBucket(item);
        setSelectedVault(null);
        map.flyTo([lat, lon], Math.max(map.getZoom(), 8), {
          animate: true,
          duration: 0.8,
        });
      });

      bucketMarkersRef.current.set(item.id, marker);
    });

    return () => {
      bucketMarkersRef.current.forEach((m) => m.remove());
      bucketMarkersRef.current.clear();
    };
  }, [bucketItems.length, isMobile]);

  /* ── interaction helpers ── */
  const flyToBucketItem = useCallback(
    (item: BucketList) => {
      const vault = item.vault;
      if (!vault || !vault.location?.lat || !vault.location?.lon) return;
      const map = mapRef.current;
      if (!map) return;
      map.flyTo([vault.location.lat, vault.location.lon], 10, {
        animate: true,
        duration: 0.9,
      });
      setSelectedBucket(item);
      setSelectedVault(null);
      if (isMobile) {
        setActivePanel("none");
      }
    },
    [isMobile],
  );

  const fitAll = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    map.invalidateSize();

    const allCoords: L.LatLngTuple[] = [];
    locatedVaults.forEach((v) =>
      allCoords.push([v.location!.lat, v.location!.lon]),
    );
    bucketItems.forEach((b) => {
      if (b.vault && b.vault.location?.lat && b.vault.location?.lon) {
        allCoords.push([b.vault.location.lat, b.vault.location.lon]);
      }
    });

    if (allCoords.length === 0) return;
    const bounds = L.latLngBounds(allCoords);
    map.flyToBounds(bounds.pad(0.3), { animate: true, duration: 1 });
  }, [locatedVaults, bucketItems]);

  /* ── custom Leaflet CSS ── */
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .tv-popup .leaflet-popup-content-wrapper {
        padding:0;border-radius:16px;overflow:hidden;
        box-shadow:0 10px 30px rgba(0,0,0,0.2);border:none;
      }
      .tv-popup .leaflet-popup-content { margin:0; width:auto!important; }
      .tv-popup .leaflet-popup-tip { display:none; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const totalVaultsOnMap = locatedVaults.length;
  const totalBucketOnMap = bucketItems.filter(
    (b) => b.vault?.location?.lat,
  ).length;

  return (
    <div className="animate-[slideDown_0.3s_ease-out] flex flex-col h-[calc(100dvh-148px)] md:h-[calc(100vh-73px)] overflow-hidden">
      <MapStatsBar
        totalVaultsOnMap={totalVaultsOnMap}
        totalBucketOnMap={totalBucketOnMap}
        stats={stats}
        fitAll={fitAll}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        isMobile={isMobile}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <div ref={mapContainerRef} className="flex-1 relative z-0" />
        <MapLegend />

        {selectedVault && (
          <VaultDetailCard
            selectedVault={selectedVault}
            setSelectedVault={setSelectedVault}
            onViewVault={(id) => navigate(`/vault/${id}`)}
          />
        )}

        {selectedBucket && !selectedVault && (
          <BucketDetailCard
            selectedBucket={selectedBucket}
            setSelectedBucket={setSelectedBucket}
            onViewVault={(id) => navigate(`/vault/${id}`)}
          />
        )}

        <BucketListPanel
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          filteredBucket={filteredBucket}
          selectedBucket={selectedBucket}
          hoveredBucketId={hoveredBucketId}
          setHoveredBucketId={setHoveredBucketId}
          flyToBucketItem={flyToBucketItem}
          isMobile={isMobile}
          stats={stats}
          onManageBucketList={() => navigate("/user/profile/bucket-list")}
        />
      </div>
    </div>
  );
}
