import type { ComponentType, Ref } from "react";

export type GisMapAsset = {
  id: string;
  label: string;
  category: string;
  coords: [number, number];
  region: string;
  linkStatus: string;
  latency: number;
  deviceType: string;
  sapLocation: string;
  outputFlow: number;
  flowLpm: number;
  pressure: number;
  criticalAlerts: number;
  lastUpdatedMinutesAgo: number;
};

export type GisMapProps = {
  themeName?: "dark" | "light";
  detailsMode?: "popup" | "panel" | "none";
  onAssetSelect?: (asset: GisMapAsset | null) => void;
  showLegend?: boolean;
  showRegionNav?: boolean;
  showZoomControls?: boolean;
};

export type GisMapHandle = {
  flyTo: (opts: {
    longitude: number;
    latitude: number;
    zoom?: number;
    bearing?: number;
    pitch?: number;
  }) => void;
  flyToAsset: (asset: GisMapAsset) => void;
  clearSelection: () => void;
};

declare const GisMap: ComponentType<GisMapProps & { ref?: Ref<GisMapHandle> }>;
export default GisMap;
