"use client";
import React, { useRef, useEffect, useState, useCallback, createContext, useContext } from "react";

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
  mapStyleUrl = "https://demotiles.maplibre.org/style.json",
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [projectFn, setProjectFn] = useState<ProjectFn | null>(null);
  const [, setMapRenderTick] = useState(0); // force update overlays on map move

  // Initialize map only when container has size
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    let map: any;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      // Optionally import CSS here if not globally loaded
      // await import("maplibre-gl/dist/maplibre-gl.css");

      map = new maplibregl.Map({
        container: mapContainer.current!,
        style: mapStyleUrl,
        center,
        zoom,
        attributionControl: false,
      });

      mapRef.current = map;

      const handleMove = () => setMapRenderTick(t => t + 1);
      map.on("move", handleMove);
      map.on("zoom", handleMove);
      map.on("resize", handleMove);

      map.on("load", () => {
        setProjectFn(() => {
          return (lngLat?: [number, number] | null): [number, number] | null => {
            if (!mapRef.current || !lngLat) return null;
            const [lng, lat] = lngLat;
            if (lng == null || lat == null) return null;
            const p = mapRef.current.project({ lng, lat });
            return [p.x, p.y] as [number, number];
          };
        });
      });

      map.on("error", (e: any) => {
        console.error("Map error:", e);
      });
    })();

    return () => {
      if (map) map.remove();
      mapRef.current = null;
    };
  }, []);

  // Smooth transitions for overlays
  const overlayClass =
    "absolute inset-0 z-10 transition-all duration-500";

  // Default minHeight if not provided
  const mergedStyle = { minHeight: 400, ...gridBgStyle, ...style };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${gridBg}`}
      style={mergedStyle}
    >
      <div ref={mapContainer} className="absolute inset-0 z-0" />
      {/* Overlays: pointer-events-auto for interactivity */}
      <MapProjectionContext.Provider value={projectFn}>
        {projectFn && children && (
          <div className={overlayClass + " pointer-events-auto"}>{children}</div>
        )}
      </MapProjectionContext.Provider>
    </div>
  );
}
