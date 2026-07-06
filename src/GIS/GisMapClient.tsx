import { Suspense, forwardRef, lazy, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { GisMapHandle, GisMapProps } from "./GisMap";

// GisMap.jsx pulls in maplibre-gl + deck.gl, which touch window/WebGL canvas
// at module scope. TanStack Start SSRs route components, so this must only
// ever be imported/rendered on the client — hence the dynamic import gated
// behind a post-mount flag, rather than a static top-level import.
const GisMap = lazy(() => import("./GisMap"));

function MapFallback() {
  return (
    <div className="grid h-full w-full place-items-center" style={{ background: "var(--ds-surface-soft)" }}>
      <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--ds-text-faint)" }}>
        <span className="h-3 w-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--ds-accent)", borderTopColor: "transparent" }} />
        Loading digital-twin GIS layer…
      </div>
    </div>
  );
}

export const GisMapClient = forwardRef<GisMapHandle, GisMapProps>(function GisMapClient(props, ref) {
  const [mounted, setMounted] = useState(false);
  const innerRef = useRef<GisMapHandle>(null);

  useEffect(() => setMounted(true), []);

  useImperativeHandle(
    ref,
    () => ({
      flyTo: (opts) => innerRef.current?.flyTo(opts),
      flyToAsset: (asset) => innerRef.current?.flyToAsset(asset),
      clearSelection: () => innerRef.current?.clearSelection(),
    }),
    [],
  );

  if (!mounted) return <MapFallback />;

  return (
    <Suspense fallback={<MapFallback />}>
      <GisMap ref={innerRef} {...props} />
    </Suspense>
  );
});

export default GisMapClient;
