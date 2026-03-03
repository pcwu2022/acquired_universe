// MapView.tsx

"use client";
import React, { useRef, useEffect, useState, useMemo, createContext, useContext } from "react";

// Do NOT statically import maplibregl for SSR safety. Import CSS via <link> in _app or layout if needed.

// Utility: dark grid background
const gridBg =
  "bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1px,transparent_1px)]";
const gridBgStyle = {
  backgroundSize: "32px 32px",
  backgroundColor: "#18181b", // Tailwind zinc-900
};

// Utility: marker glow class (to be used by children)
export const markerGlowClass =
  "shadow-[0_0_12px_4px_rgba(0,255,255,0.25)] transition-shadow duration-300";


// Context: provides project([lng, lat]) => [x, y] for overlay positioning

type ProjectFn = (lngLat?: [number, number] | null) => [number, number] | null;
const MapProjectionContext = createContext<ProjectFn | null>(null);

export function useMapProjection() {
  return useContext(MapProjectionContext);
}

type MapViewProps = {
  center: [number, number]; // [lng, lat]
  zoom?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  mapStyleUrl?: string; // Allow custom map style
};

export default function MapView({
  center,
  zoom = 2,
  children,
  style,
  mapStyleUrl = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const projectRef = useRef<ProjectFn | null>(null);
  // Each tick increment creates a new projectFn via useMemo, changing context value
  // and forcing all consumers (MapOverlayContent) to re-render with fresh coordinates.
  const [mapTick, setMapRenderTick] = useState(0);

  // Initialize map only when container has size
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // cancelled flag: if the component unmounts before the async resolves,
    // we skip all post-await setup so no stale closures fire setState on a
    // dead component instance.
    let cancelled = false;
    let map: any;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !mapContainer.current) return;

      map = new maplibregl.Map({
        container: mapContainer.current,
        style: mapStyleUrl,
        center,
        zoom,
        attributionControl: false,
      });

      mapRef.current = map;

      const stableProject: ProjectFn = (lngLat) => {
        if (!mapRef.current || !lngLat) return null;
        const [lng, lat] = lngLat;
        if (lng == null || lat == null) return null;
        const p = mapRef.current.project({ lng, lat });
        return [p.x, p.y];
      };

      projectRef.current = stableProject;

      const handleMove = () => {
        if (cancelled) return;
        projectRef.current = stableProject;
        setMapRenderTick(t => t + 1);
      };
      map.on("move", handleMove);
      map.on("zoom", handleMove);
      map.on("resize", handleMove);

      map.on("load", () => {
        if (cancelled) return;
        projectRef.current = stableProject;
        setMapRenderTick(t => t + 1);
      });

      map.on("error", (e: any) => {
        console.error("Map error:", e);
      });
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
      mapRef.current = null;
      projectRef.current = null;
    };
  }, []);

  // Smooth transitions for overlays
  const overlayClass =
    "absolute inset-0 z-10 transition-all duration-500";

  // Default minHeight if not provided
  const mergedStyle = { minHeight: 400, ...gridBgStyle, ...style };

  // A NEW function reference is produced on every mapTick so React detects the
  // context value change and re-renders MapOverlayContent (= fresh x/y projection).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const projectFn = useMemo((): ProjectFn => {
    return (lngLat?: [number, number] | null): [number, number] | null => {
      if (!projectRef.current) return null;
      return projectRef.current(lngLat ?? null);
    };
  // mapTick is intentionally the only dep — we want a new fn on every map move
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapTick]);
  return (
    <div
      className={`relative w-full h-full overflow-hidden ${gridBg}`}
      style={mergedStyle}
    >
      <div ref={mapContainer} className="absolute inset-0 z-0" />
      {/* Overlays: pointer-events-auto for interactivity */}
      <MapProjectionContext.Provider value={projectFn}>
        <div className={overlayClass + " pointer-events-none"}>
          {/* mapTick > 0 means the map has fired at least one load/move event */}
          {mapTick > 0 && children}
        </div>
      </MapProjectionContext.Provider>
    </div>
  );
}
