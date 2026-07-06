/**
 * GisMap — self-contained Project WAVE digital-twin map.
 *
 * Drop this single file into another dashboard project and import it:
 *
 *   import GisMap from './GisMap';
 *   <GisMap />
 *
 * Peer dependencies (install in the target project):
 *   npm install react react-dom @deck.gl/core @deck.gl/layers @deck.gl/react maplibre-gl react-map-gl
 *
 * Everything the map needs — mock data, deck.gl layers, tooltip/popup/zone
 * card UI, legend, region nav, zoom controls, and styles — lives in this one
 * file. Styles are injected at runtime via a <style> tag and scoped under
 * the `.gis-map` class with `--gis-*` custom properties, so it won't collide
 * with the host dashboard's own CSS variables or classes.
 *
 * Props:
 *   themeName    'dark' | 'light'                (default 'dark')
 *   detailsMode  'popup' | 'panel' | 'none'       (default 'popup')
 *   onAssetSelect(asset | null)                   called whenever the selected asset changes
 *   showLegend, showRegionNav, showZoomControls   booleans (default true)
 *
 * Ref API (via useRef + <GisMap ref={...} />):
 *   flyTo({ longitude, latitude, zoom, bearing, pitch })
 *   flyToAsset(asset)
 *   clearSelection()
 */
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import MaplibreMap from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { PolygonLayer, PathLayer, IconLayer, ScatterplotLayer } from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

/* ------------------------------------------------------------------------ */
/* Styles                                                                    */
/* ------------------------------------------------------------------------ */

const GIS_CSS = `
.gis-map {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 320px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--gis-text);
}

.gis-map__canvas {
  position: absolute;
  inset: 0;
}

.gis-map__canvas > div:first-child {
  width: 100%;
  height: 100%;
}

.gis-tooltip {
  position: absolute;
  z-index: 20;
  pointer-events: none;
  background: var(--gis-glass-bg);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid var(--gis-glass-border);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12px;
  color: var(--gis-text);
  min-width: 170px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
}
.gis-tooltip__title { font-weight: 700; font-size: 13px; margin-bottom: 6px; }
.gis-tooltip__row { padding: 2px 0; }
.gis-tooltip__row--status { margin-top: 6px; }
.gis-tooltip__label { color: var(--gis-text-muted); margin-right: 4px; }

.gis-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  line-height: 1.6;
  white-space: nowrap;
}
.gis-status-badge--sm { font-size: 10px; padding: 2px 8px; }
.gis-status-badge__dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
.gis-status-badge--connected { background: rgba(76, 184, 138, 0.16); color: #4cb88a; }
.gis-status-badge--connected .gis-status-badge__dot { background: #4cb88a; box-shadow: 0 0 6px #4cb88a; }
.gis-status-badge--degraded { background: rgba(224, 162, 63, 0.16); color: #e0a23f; }
.gis-status-badge--degraded .gis-status-badge__dot { background: #e0a23f; box-shadow: 0 0 6px #e0a23f; }
.gis-status-badge--offline { background: rgba(224, 88, 74, 0.16); color: #e0584a; }
.gis-status-badge--offline .gis-status-badge__dot { background: #e0584a; box-shadow: 0 0 6px #e0584a; }

.gis-asset-popup {
  position: absolute;
  z-index: 30;
  width: 320px;
  background: var(--gis-glass-bg);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid var(--gis-glass-border);
  border-radius: 16px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  overflow: hidden;
  animation: gis-popup-rise 0.18s ease-out;
}
@keyframes gis-popup-rise {
  from { opacity: 0; transform: translateY(6px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.gis-asset-popup--alarmed {
  box-shadow: 0 20px 48px rgba(224, 88, 74, 0.35), 0 0 0 1px rgba(224, 88, 74, 0.4) inset;
}
.gis-asset-popup__close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: var(--gis-text);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  z-index: 2;
  transition: background-color 0.15s ease;
}
.gis-asset-popup__close:hover { background: rgba(255, 255, 255, 0.18); }
.gis-asset-popup__hero {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 14px;
  border-bottom: 1px solid var(--gis-glass-border);
}
.gis-asset-popup__icon { width: 48px; height: 48px; flex-shrink: 0; filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4)); }
.gis-asset-popup__hero-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.gis-asset-popup__name {
  margin: 0; font-size: 16px; font-weight: 700; color: var(--gis-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.gis-asset-popup__category { font-size: 11px; color: var(--gis-text-muted); text-transform: uppercase; letter-spacing: 0.4px; }
.gis-asset-popup__tabs { display: flex; padding: 8px 10px 0; gap: 4px; border-bottom: 1px solid var(--gis-glass-border); }
.gis-asset-popup__tab {
  flex: 1; background: none; border: none; color: var(--gis-text-muted);
  font-size: 11px; font-weight: 600; letter-spacing: 0.2px; padding: 8px 4px;
  cursor: pointer; border-bottom: 2px solid transparent;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.gis-asset-popup__tab:hover { color: var(--gis-text); }
.gis-asset-popup__tab--active { color: var(--gis-accent); border-bottom-color: var(--gis-accent); }
.gis-asset-popup__body { padding: 14px 16px 6px; min-height: 150px; }
.gis-asset-popup__kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.gis-kpi-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--gis-glass-border);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: background-color 0.3s ease;
}
.gis-kpi-card--alert { background: rgba(224, 88, 74, 0.12); border-color: rgba(224, 88, 74, 0.35); }
.gis-kpi-card__label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--gis-text-muted); }
.gis-kpi-card__value { font-size: 17px; font-weight: 700; color: var(--gis-text); }
.gis-kpi-card__value small { font-size: 11px; font-weight: 500; color: var(--gis-text-muted); margin-left: 2px; }
.gis-kpi-card--alert .gis-kpi-card__value { color: var(--gis-danger); }
.gis-asset-popup__fields { display: flex; flex-direction: column; gap: 8px; }
.gis-asset-popup__field {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 12px; padding: 4px 0; border-bottom: 1px dashed var(--gis-glass-border);
}
.gis-asset-popup__field-label { color: var(--gis-text-muted); }
.gis-asset-popup__field-value { color: var(--gis-text); font-weight: 600; text-align: right; }
.gis-asset-popup__telemetry { display: flex; flex-direction: column; gap: 8px; }
.gis-telemetry-row {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 12px; color: var(--gis-text-muted); padding: 6px 0; border-bottom: 1px dashed var(--gis-glass-border);
}
.gis-telemetry-row strong { color: var(--gis-text); font-weight: 700; }
.gis-asset-popup__hint { margin: 6px 0 0; font-size: 11px; color: var(--gis-text-muted); font-style: italic; }
.gis-asset-popup__history { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.gis-history-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--gis-text); }
.gis-history-item__dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.gis-history-item--info .gis-history-item__dot { background: var(--gis-accent); }
.gis-history-item--warn .gis-history-item__dot { background: var(--gis-warning); }
.gis-history-item--success .gis-history-item__dot { background: var(--gis-success); }
.gis-history-item__label { flex: 1; }
.gis-history-item__time { color: var(--gis-text-muted); font-size: 11px; flex-shrink: 0; }
.gis-asset-popup__maintenance { display: flex; flex-direction: column; gap: 8px; }
.gis-asset-popup__drilldown {
  width: calc(100% - 32px);
  margin: 6px 16px 16px;
  padding: 10px;
  background: var(--gis-accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease;
}
.gis-asset-popup__drilldown:hover { background-color: var(--gis-accent-soft); transform: translateY(-1px); }

.gis-zone-card {
  position: absolute;
  z-index: 29;
  width: 260px;
  background: var(--gis-glass-bg);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid var(--gis-glass-border);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
  padding: 14px 16px;
  animation: gis-zone-card-rise 0.18s ease-out;
}
@keyframes gis-zone-card-rise {
  from { opacity: 0; transform: translateY(6px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.gis-zone-card--alert { box-shadow: 0 16px 40px rgba(224, 88, 74, 0.3), 0 0 0 1px rgba(224, 88, 74, 0.35) inset; }
.gis-zone-card__close {
  position: absolute; top: 10px; right: 10px; width: 22px; height: 22px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.08); border: none; color: var(--gis-text); font-size: 15px;
  line-height: 1; cursor: pointer;
}
.gis-zone-card__close:hover { background: rgba(255, 255, 255, 0.18); }
.gis-zone-card__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; padding-right: 20px; }
.gis-zone-card__name { margin: 0; font-size: 15px; font-weight: 700; color: var(--gis-text); }
.gis-zone-card__type {
  flex-shrink: 0; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;
  padding: 3px 8px; border-radius: 999px; background: rgba(90, 160, 230, 0.16); color: #5aa0e6;
}
.gis-zone-card__type--alert { background: rgba(224, 88, 74, 0.16); color: var(--gis-danger); }
.gis-zone-card__region { display: block; font-size: 11px; color: var(--gis-text-muted); margin-top: 2px; }
.gis-zone-card__stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
.gis-zone-card__stat {
  background: rgba(255, 255, 255, 0.04); border: 1px solid var(--gis-glass-border); border-radius: 8px;
  padding: 8px 10px; display: flex; flex-direction: column; gap: 2px;
}
.gis-zone-card__stat--alert .gis-zone-card__stat-value { color: var(--gis-danger); }
.gis-zone-card__stat-value { font-size: 16px; font-weight: 700; color: var(--gis-text); }
.gis-zone-card__stat-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.4px; color: var(--gis-text-muted); }
.gis-zone-card__hint { margin: 10px 0 0; font-size: 11px; color: var(--gis-text-muted); font-style: italic; }

.gis-map-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 6;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--gis-glass-bg);
  backdrop-filter: blur(14px) saturate(150%);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
  border: 1px solid var(--gis-glass-border);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
.gis-map-controls__btn {
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; border-radius: 8px; font-size: 16px; color: var(--gis-text);
  cursor: pointer; transition: background-color 0.15s ease;
}
.gis-map-controls__btn:hover { background: rgba(255, 255, 255, 0.1); }

.gis-region-nav {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 6;
  display: flex;
  gap: 6px;
  background: var(--gis-glass-bg);
  backdrop-filter: blur(14px) saturate(150%);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
  border: 1px solid var(--gis-glass-border);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
.gis-region-nav__btn {
  background: transparent; border: none; border-radius: 8px; padding: 7px 14px;
  font-size: 12px; font-weight: 600; color: var(--gis-text); cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease; white-space: nowrap;
}
.gis-region-nav__btn:hover { background: var(--gis-accent); color: #fff; }
@media (max-width: 720px) {
  .gis-region-nav { flex-wrap: wrap; max-width: 220px; }
}

.gis-legend {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: var(--gis-glass-bg);
  backdrop-filter: blur(14px) saturate(150%);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
  border: 1px solid var(--gis-glass-border);
  border-radius: 12px;
  padding: 12px 16px;
  z-index: 5;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  max-width: 200px;
}
.gis-legend__heading { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--gis-text-muted); margin: 0 0 8px 0; font-weight: 600; }
.gis-legend__heading--spaced { margin-top: 10px; }
.gis-legend__row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--gis-text); padding: 3px 0; }
.gis-legend__icon { width: 18px; height: 18px; flex-shrink: 0; }
.gis-legend__swatch { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.gis-legend__line { width: 16px; height: 4px; border-radius: 2px; display: inline-block; flex-shrink: 0; }
`;

function useInjectGisStyles() {
  useEffect(() => {
    const STYLE_ID = 'gis-map-styles';
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = GIS_CSS;
    document.head.appendChild(style);
  }, []);
}

/* ------------------------------------------------------------------------ */
/* Theme                                                                     */
/* ------------------------------------------------------------------------ */

const THEMES = {
  dark: {
    name: 'dark',
    mapStyle: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    colors: {
      bg: '#11151a',
      text: '#d7dee5',
      textMuted: '#8a96a3',
      accent: '#3fa6e0',
      accentSoft: '#2c7aa8',
      danger: '#e0584a',
      warning: '#e0a23f',
      success: '#4cb88a',
      glassBg: 'rgba(27, 34, 42, 0.62)',
      glassBorder: 'rgba(255, 255, 255, 0.08)',
    },
  },
  light: {
    name: 'light',
    mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    colors: {
      bg: '#f4f6f8',
      text: '#1c2630',
      textMuted: '#5a6573',
      accent: '#1b6fa8',
      accentSoft: '#3f8fc4',
      danger: '#c5392c',
      warning: '#b5781f',
      success: '#2f8f63',
      glassBg: 'rgba(255, 255, 255, 0.7)',
      glassBorder: 'rgba(20, 30, 40, 0.1)',
    },
  },
};

function themeCssVars(theme) {
  return {
    '--gis-bg': theme.colors.bg,
    '--gis-text': theme.colors.text,
    '--gis-text-muted': theme.colors.textMuted,
    '--gis-accent': theme.colors.accent,
    '--gis-accent-soft': theme.colors.accentSoft,
    '--gis-danger': theme.colors.danger,
    '--gis-warning': theme.colors.warning,
    '--gis-success': theme.colors.success,
    '--gis-glass-bg': theme.colors.glassBg,
    '--gis-glass-border': theme.colors.glassBorder,
  };
}

/* ------------------------------------------------------------------------ */
/* Mock data — assets                                                        */
/* ------------------------------------------------------------------------ */

export const ASSET_CATEGORIES = {
  WATER_PRODUCTION: 'WATER_PRODUCTION',
  WATER_PUMPING: 'WATER_PUMPING',
  WATER_METERING: 'WATER_METERING',
  GAS_STATION: 'GAS_STATION',
  CONSTRUCTION: 'CONSTRUCTION',
};

export const CATEGORY_META = {
  [ASSET_CATEGORIES.WATER_PRODUCTION]: { label: 'Water Production Plants', color: [0, 153, 255], icon: 'plant' },
  [ASSET_CATEGORIES.WATER_PUMPING]: { label: 'Water Pumping Stations', color: [0, 200, 150], icon: 'pump' },
  [ASSET_CATEGORIES.WATER_METERING]: { label: 'Water Metering Nodes', color: [255, 196, 0], icon: 'meter' },
  [ASSET_CATEGORIES.GAS_STATION]: { label: 'Gas Stations', color: [255, 90, 90], icon: 'gas' },
  [ASSET_CATEGORIES.CONSTRUCTION]: { label: 'Construction Sites', color: [180, 140, 255], icon: 'construction' },
};

const DEVICE_TYPES = [
  'Schneider M340 PLC',
  'Siemens S7-1200 PLC',
  'Allen-Bradley CompactLogix',
  'Honeywell RTU',
  'Yokogawa Flow Computer',
];

function deviceFor(seed) {
  return DEVICE_TYPES[seed % DEVICE_TYPES.length];
}

const RAW_ASSETS = [
  { id: 'HMYRO', category: ASSET_CATEGORIES.WATER_PRODUCTION, coords: [55.3905, 25.3573], region: 'Sharjah' },
  { id: 'RHMRO', category: ASSET_CATEGORIES.WATER_PRODUCTION, coords: [55.4302, 25.3201], region: 'Sharjah' },
  { id: 'MHDRO', category: ASSET_CATEGORIES.WATER_PRODUCTION, coords: [55.4521, 25.2987], region: 'Sharjah' },
  { id: 'THLRO', category: ASSET_CATEGORIES.WATER_PRODUCTION, coords: [55.4756, 25.3645], region: 'Sharjah' },
  { id: 'NZWRO', category: ASSET_CATEGORIES.WATER_PRODUCTION, coords: [55.5450, 25.3150], region: 'Sharjah' },
  { id: 'SBNRO', category: ASSET_CATEGORIES.WATER_PRODUCTION, coords: [55.5550, 25.3000], region: 'Sharjah' },
  { id: 'KLBDS', category: ASSET_CATEGORIES.WATER_PRODUCTION, coords: [56.3517, 25.0795], region: 'Kalba' },
  { id: 'KFRRO', category: ASSET_CATEGORIES.WATER_PRODUCTION, coords: [56.3417, 25.3309], region: 'Khorfakkan' },

  { id: 'LYYDS', category: ASSET_CATEGORIES.WATER_PUMPING, coords: [55.4012, 25.3412], region: 'Sharjah' },
  { id: 'FLJPS', category: ASSET_CATEGORIES.WATER_PUMPING, coords: [55.4189, 25.3056], region: 'Sharjah' },
  { id: 'BDAPS', category: ASSET_CATEGORIES.WATER_PUMPING, coords: [55.4367, 25.2890], region: 'Sharjah' },
  { id: 'HMDPS', category: ASSET_CATEGORIES.WATER_PUMPING, coords: [55.4598, 25.3123], region: 'Sharjah' },
  { id: 'HMTPS', category: ASSET_CATEGORIES.WATER_PUMPING, coords: [55.4789, 25.3367], region: 'Sharjah' },
  { id: 'ZBRPS', category: ASSET_CATEGORIES.WATER_PUMPING, coords: [55.5034, 25.3501], region: 'Sharjah' },
  { id: 'P5123', category: ASSET_CATEGORIES.WATER_PUMPING, coords: [55.4900, 25.3450], region: 'Sharjah' },
  { id: 'LLLYPS', category: ASSET_CATEGORIES.WATER_PUMPING, coords: [55.4080, 25.3650], region: 'Sharjah' },
  { id: 'QDSPS', category: ASSET_CATEGORIES.WATER_PUMPING, coords: [55.4250, 25.3700], region: 'Sharjah' },
  { id: 'BRWST', category: ASSET_CATEGORIES.WATER_PUMPING, coords: [56.3289, 25.0912], region: 'Kalba' },
  { id: 'SHBPS', category: ASSET_CATEGORIES.WATER_PUMPING, coords: [56.3601, 25.3456], region: 'Khorfakkan' },

  { id: 'TQAIN-SHJ', label: 'TQAIN Sharjah', category: ASSET_CATEGORIES.WATER_METERING, coords: [55.4023, 25.3567], region: 'Sharjah' },
  { id: 'ETHIN-SHJ', label: 'ETHIN Sharjah', category: ASSET_CATEGORIES.WATER_METERING, coords: [55.4256, 25.3401], region: 'Sharjah' },
  { id: 'UTCIN-SHJ', label: 'UTCIN Sharjah', category: ASSET_CATEGORIES.WATER_METERING, coords: [55.4478, 25.3234], region: 'Sharjah' },
  { id: 'ALPIN-KLB', label: 'ALPIN Kalba', category: ASSET_CATEGORIES.WATER_METERING, coords: [56.3389, 25.0834], region: 'Kalba' },
  { id: 'TQAIN-KLB', label: 'TQAIN Kalba', category: ASSET_CATEGORIES.WATER_METERING, coords: [56.3512, 25.0967], region: 'Kalba' },
  { id: 'ETHIN-KLB', label: 'ETHIN Kalba', category: ASSET_CATEGORIES.WATER_METERING, coords: [56.3450, 25.0750], region: 'Kalba' },
  { id: 'TQAIN-KFR', label: 'TQAIN Khorfakkan', category: ASSET_CATEGORIES.WATER_METERING, coords: [56.3478, 25.3389], region: 'Khorfakkan' },
  { id: 'ETHIN-KFR', label: 'ETHIN Khorfakkan', category: ASSET_CATEGORIES.WATER_METERING, coords: [56.3556, 25.3501], region: 'Khorfakkan' },

  { id: 'Station-1', category: ASSET_CATEGORIES.GAS_STATION, coords: [55.3956, 25.3489], region: 'Sharjah' },
  { id: 'Station-2', category: ASSET_CATEGORIES.GAS_STATION, coords: [55.4145, 25.3678], region: 'Sharjah' },
  { id: 'Station-3', category: ASSET_CATEGORIES.GAS_STATION, coords: [55.4389, 25.3845], region: 'Sharjah' },
  { id: 'Station-4', category: ASSET_CATEGORIES.GAS_STATION, coords: [55.4550, 25.3650], region: 'Sharjah' },
  { id: 'Station-5', category: ASSET_CATEGORIES.GAS_STATION, coords: [55.4700, 25.3050], region: 'Sharjah' },
  { id: 'Station-6', category: ASSET_CATEGORIES.GAS_STATION, coords: [56.3312, 25.0723], region: 'Kalba' },
  { id: 'Station-7', category: ASSET_CATEGORIES.GAS_STATION, coords: [56.3489, 25.3267], region: 'Khorfakkan' },
  { id: 'Station-8', category: ASSET_CATEGORIES.GAS_STATION, coords: [56.2645, 25.5934], region: 'Dibba' },

  { id: 'ZBRUC', category: ASSET_CATEGORIES.CONSTRUCTION, coords: [55.4900, 25.2950], region: 'Sharjah' },
  { id: 'BDAUC', category: ASSET_CATEGORIES.CONSTRUCTION, coords: [55.4456, 25.2812], region: 'Sharjah' },
  { id: 'BRRUC', category: ASSET_CATEGORIES.CONSTRUCTION, coords: [55.4400, 25.3700], region: 'Sharjah' },
  { id: 'HMYIW', category: ASSET_CATEGORIES.CONSTRUCTION, coords: [55.4150, 25.3450], region: 'Sharjah' },
  { id: 'AGLUC', category: ASSET_CATEGORIES.CONSTRUCTION, coords: [55.4678, 25.3289], region: 'Sharjah' },
  { id: 'WAHUC', category: ASSET_CATEGORIES.CONSTRUCTION, coords: [56.3401, 25.0856], region: 'Kalba' },
  { id: 'JADUC', category: ASSET_CATEGORIES.CONSTRUCTION, coords: [56.3534, 25.3423], region: 'Khorfakkan' },
];

function sapLocationFor(id, category) {
  const prefixMap = {
    [ASSET_CATEGORIES.WATER_PRODUCTION]: 'RO-PLANT',
    [ASSET_CATEGORIES.WATER_PUMPING]: 'PUMP-01',
    [ASSET_CATEGORIES.WATER_METERING]: 'METER-01',
    [ASSET_CATEGORIES.GAS_STATION]: 'GAS-01',
    [ASSET_CATEGORIES.CONSTRUCTION]: 'SITE-01',
  };
  return `FL-SHJ-${id.replace(/\s+/g, '').toUpperCase()}-${prefixMap[category]}`;
}

// Deterministic pseudo-random generator from string seed so values are stable
// across renders without needing persisted backend state.
function seededValue(id, min, max) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const ratio = (hash % 1000) / 1000;
  return min + ratio * (max - min);
}

export const LINK_STATUS = {
  CONNECTED: 'Connected',
  DEGRADED: 'Degraded',
  OFFLINE: 'Offline',
};

function linkStatusFor(criticalAlerts) {
  if (criticalAlerts >= 3) return LINK_STATUS.OFFLINE;
  if (criticalAlerts >= 1) return LINK_STATUS.DEGRADED;
  return LINK_STATUS.CONNECTED;
}

export const ASSETS = RAW_ASSETS.map((asset, index) => {
  const latency = Math.round(seededValue(asset.id, 8, 45));
  const outputFlow = Math.round(seededValue(asset.id + 'flow', 300, 1600));
  const flowLpm = Math.round((outputFlow * 1000) / 60);
  const pressure = Math.round(seededValue(asset.id + 'pressure', 2.1, 5.8) * 10) / 10;
  const alertRoll = seededValue(asset.id + 'alerts', 0, 1);
  const criticalAlerts = alertRoll > 0.97 ? 3 : alertRoll > 0.9 ? 2 : alertRoll > 0.75 ? 1 : 0;
  const linkStatus = linkStatusFor(criticalAlerts);
  const lastUpdatedMinutesAgo = Math.round(seededValue(asset.id + 'updated', 1, 45));

  return {
    ...asset,
    label: asset.label || asset.id,
    deviceType: deviceFor(index),
    linkStatus,
    latency,
    sapLocation: sapLocationFor(asset.id, asset.category),
    outputFlow,
    flowLpm,
    pressure,
    criticalAlerts,
    lastUpdatedMinutesAgo,
  };
});

export function getAssetsByCategory(category) {
  return ASSETS.filter((asset) => asset.category === category);
}

/* ------------------------------------------------------------------------ */
/* Mock data — pipelines                                                     */
/* ------------------------------------------------------------------------ */

export const PIPELINE_STATES = { NORMAL: 'NORMAL', RESTRICTION: 'RESTRICTION', STAGNANT: 'STAGNANT' };

export const PIPELINE_STATE_META = {
  [PIPELINE_STATES.NORMAL]: { label: 'Normal', color: [70, 130, 220] },
  [PIPELINE_STATES.RESTRICTION]: { label: 'High Friction Restriction', color: [255, 140, 0] },
  [PIPELINE_STATES.STAGNANT]: { label: 'Stagnant Water Age', color: [150, 80, 210] },
};

export const PIPELINES = [
  { id: 'PL-SHJ-001', name: 'Hamriyah Trunk Main', state: PIPELINE_STATES.NORMAL, path: [[55.3905, 25.3573], [55.4012, 25.3412], [55.4189, 25.3056]] },
  { id: 'PL-SHJ-002', name: 'Rahmaniya Distribution Line', state: PIPELINE_STATES.NORMAL, path: [[55.4302, 25.3201], [55.4367, 25.2890], [55.4456, 25.2812]] },
  { id: 'PL-SHJ-003', name: 'Muhaisanah Feeder', state: PIPELINE_STATES.RESTRICTION, path: [[55.4521, 25.2987], [55.4598, 25.3123], [55.4789, 25.3367]] },
  { id: 'PL-SHJ-004', name: 'Thaalith Loop Main', state: PIPELINE_STATES.NORMAL, path: [[55.4756, 25.3645], [55.5034, 25.3501], [55.4900, 25.3450]] },
  { id: 'PL-SHJ-005', name: 'Nuzha West Connector', state: PIPELINE_STATES.STAGNANT, path: [[55.5450, 25.3150], [55.4900, 25.2950], [55.5550, 25.3000]] },
  { id: 'PL-SHJ-006', name: 'Sabkha Northern Line', state: PIPELINE_STATES.NORMAL, path: [[55.4080, 25.3650], [55.4250, 25.3700], [55.3905, 25.3573]] },
  { id: 'PL-SHJ-007', name: 'Layyah Coastal Main', state: PIPELINE_STATES.RESTRICTION, path: [[55.4012, 25.3412], [55.4023, 25.3567], [55.4145, 25.3678]] },
  { id: 'PL-SHJ-008', name: 'Buhaira Ring Feeder', state: PIPELINE_STATES.NORMAL, path: [[55.4256, 25.3401], [55.4389, 25.3845], [55.4550, 25.3650]] },
  { id: 'PL-SHJ-009', name: 'Al Qadisiya Branch', state: PIPELINE_STATES.STAGNANT, path: [[55.4478, 25.3234], [55.4623, 25.3289], [55.4700, 25.3050]] },
  { id: 'PL-KLB-001', name: 'Kalba Coastal Trunk', state: PIPELINE_STATES.NORMAL, path: [[56.3517, 25.0795], [56.3389, 25.0834], [56.3289, 25.0912]] },
  { id: 'PL-KLB-002', name: 'Kalba Desalination Feeder', state: PIPELINE_STATES.RESTRICTION, path: [[56.3512, 25.0967], [56.3401, 25.0856], [56.3312, 25.0723]] },
  { id: 'PL-KLB-003', name: 'Wahla Construction Bypass', state: PIPELINE_STATES.STAGNANT, path: [[56.3450, 25.0750], [56.3601, 25.0945], [56.3517, 25.0795]] },
  { id: 'PL-KFR-001', name: 'Khorfakkan Mountain Main', state: PIPELINE_STATES.NORMAL, path: [[56.3417, 25.3309], [56.3478, 25.3389], [56.3556, 25.3501]] },
  { id: 'PL-KFR-002', name: 'Khorfakkan Port Branch', state: PIPELINE_STATES.RESTRICTION, path: [[56.3601, 25.3456], [56.3534, 25.3423], [56.3489, 25.3267]] },
  { id: 'PL-DBA-001', name: 'Dibba Northern Supply', state: PIPELINE_STATES.NORMAL, path: [[56.2645, 25.5934], [56.2712, 25.5867], [56.2700, 25.5800]] },
];

/* ------------------------------------------------------------------------ */
/* Mock data — DMA / pressure zones                                         */
/* ------------------------------------------------------------------------ */

export const ZONE_TYPES = { NORMAL: 'NORMAL', ALERT: 'ALERT' };

export const ZONE_TYPE_META = {
  [ZONE_TYPES.NORMAL]: { label: 'Normal Zone', borderColor: [90, 160, 230], fillColor: [90, 160, 230, 35] },
  [ZONE_TYPES.ALERT]: { label: 'Alert Zone', borderColor: [235, 70, 50], fillColor: [235, 70, 50, 45] },
};

export const ZONES = [
  { id: 'DMA-SHJ-01', name: 'Hamriyah DMA', region: 'Sharjah', type: ZONE_TYPES.NORMAL, polygon: [[55.3850, 25.3500], [55.3830, 25.3670], [55.3990, 25.3690], [55.4080, 25.3580], [55.4040, 25.3430], [55.3870, 25.3400]] },
  { id: 'DMA-SHJ-02', name: 'Rahmaniya DMA', region: 'Sharjah', type: ZONE_TYPES.ALERT, polygon: [[55.4150, 25.3260], [55.4230, 25.3380], [55.4400, 25.3400], [55.4520, 25.3300], [55.4470, 25.3140], [55.4280, 25.3080]] },
  { id: 'DMA-SHJ-03', name: 'Muhaisanah DMA', region: 'Sharjah', type: ZONE_TYPES.NORMAL, polygon: [[55.4380, 25.3050], [55.4420, 25.3180], [55.4580, 25.3220], [55.4720, 25.3120], [55.4680, 25.2950], [55.4500, 25.2880]] },
  { id: 'DMA-SHJ-04', name: 'Thaalith DMA', region: 'Sharjah', type: ZONE_TYPES.NORMAL, polygon: [[55.4600, 25.3500], [55.4650, 25.3650], [55.4800, 25.3760], [55.4950, 25.3700], [55.4920, 25.3540], [55.4760, 25.3460]] },
  { id: 'DMA-SHJ-05', name: 'Nuzha West DMA', region: 'Sharjah', type: ZONE_TYPES.ALERT, polygon: [[55.4880, 25.3700], [55.4950, 25.3850], [55.5100, 25.3950], [55.5260, 25.3880], [55.5230, 25.3720], [55.5060, 25.3640]] },
  { id: 'DMA-SHJ-07', name: 'Buhaira DMA', region: 'Sharjah', type: ZONE_TYPES.NORMAL, polygon: [[55.4180, 25.3680], [55.4230, 25.3830], [55.4400, 25.3820], [55.4500, 25.3750], [55.4550, 25.3700], [55.4460, 25.3650]] },
  { id: 'DMA-KLB-01', name: 'Kalba Coastal DMA', region: 'Kalba', type: ZONE_TYPES.NORMAL, polygon: [[56.3120, 25.0780], [56.3180, 25.0930], [56.3340, 25.1000], [56.3500, 25.0920], [56.3460, 25.0760], [56.3280, 25.0680]] },
  { id: 'DMA-KLB-02', name: 'Kalba Desal DMA', region: 'Kalba', type: ZONE_TYPES.ALERT, polygon: [[56.3260, 25.0920], [56.3300, 25.1060], [56.3460, 25.1160], [56.3640, 25.1080], [56.3600, 25.0930], [56.3420, 25.0860]] },
  { id: 'DMA-KFR-01', name: 'Khorfakkan Mountain DMA', region: 'Khorfakkan', type: ZONE_TYPES.NORMAL, polygon: [[56.3270, 25.3270], [56.3320, 25.3420], [56.3480, 25.3500], [56.3640, 25.3420], [56.3600, 25.3260], [56.3420, 25.3190]] },
  { id: 'DMA-DBA-01', name: 'Dibba Northern DMA', region: 'Dibba', type: ZONE_TYPES.NORMAL, polygon: [[56.2470, 25.5830], [56.2520, 25.5980], [56.2680, 25.6080], [56.2850, 25.6000], [56.2820, 25.5840], [56.2640, 25.5760]] },
];

export function getZoneStats(zone) {
  function pointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  const assetsInZone = ASSETS.filter((asset) => pointInPolygon(asset.coords, zone.polygon));
  const alertCount = assetsInZone.reduce((sum, asset) => sum + asset.criticalAlerts, 0);
  const onlineCount = assetsInZone.filter((asset) => asset.linkStatus !== LINK_STATUS.OFFLINE).length;
  const avgPressure = assetsInZone.length
    ? assetsInZone.reduce((sum, asset) => sum + asset.pressure, 0) / assetsInZone.length
    : 0;

  return { assetCount: assetsInZone.length, onlineCount, alertCount, avgPressure, assets: assetsInZone };
}

/* ------------------------------------------------------------------------ */
/* Mock data — quick-nav regions                                            */
/* ------------------------------------------------------------------------ */

export const REGIONS = [
  { id: 'sharjah', label: 'Sharjah', longitude: 55.4209, latitude: 25.3463, zoom: 11 },
  { id: 'kalba', label: 'Kalba', longitude: 56.3517, latitude: 25.0795, zoom: 12.5 },
  { id: 'khorfakkan', label: 'Khorfakkan', longitude: 56.3417, latitude: 25.3309, zoom: 12.5 },
  { id: 'dibba', label: 'Dibba', longitude: 56.2645, latitude: 25.5934, zoom: 12.5 },
];

/* ------------------------------------------------------------------------ */
/* Network connectivity (asset <-> pipeline)                                */
/* ------------------------------------------------------------------------ */

const EPSILON = 1e-4;

function coordsEqual(a, b) {
  return Math.abs(a[0] - b[0]) < EPSILON && Math.abs(a[1] - b[1]) < EPSILON;
}

function pointToSegmentDistSq(p, a, b) {
  const [px, py] = p;
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  const ddx = px - cx;
  const ddy = py - cy;
  return ddx * ddx + ddy * ddy;
}

function distanceToPipeline(coords, pipeline) {
  let min = Infinity;
  for (let i = 0; i < pipeline.path.length - 1; i++) {
    const d = pointToSegmentDistSq(coords, pipeline.path[i], pipeline.path[i + 1]);
    if (d < min) min = d;
  }
  return min;
}

function nearestPipelineId(coords) {
  let bestId = null;
  let bestDist = Infinity;
  PIPELINES.forEach((pipeline) => {
    const d = distanceToPipeline(coords, pipeline);
    if (d < bestDist) {
      bestDist = d;
      bestId = pipeline.id;
    }
  });
  return bestId;
}

const pipelineToAssetIds = new Map();
const assetToPipelineIds = new Map();

PIPELINES.forEach((pipeline) => {
  const matchedAssetIds = [];
  pipeline.path.forEach((point) => {
    ASSETS.forEach((asset) => {
      if (coordsEqual(asset.coords, point)) matchedAssetIds.push(asset.id);
    });
  });
  pipelineToAssetIds.set(pipeline.id, matchedAssetIds);
  matchedAssetIds.forEach((assetId) => {
    if (!assetToPipelineIds.has(assetId)) assetToPipelineIds.set(assetId, []);
    assetToPipelineIds.get(assetId).push(pipeline.id);
  });
});

ASSETS.forEach((asset) => {
  if (assetToPipelineIds.has(asset.id)) return;
  const nearestId = nearestPipelineId(asset.coords);
  if (!nearestId) return;
  assetToPipelineIds.set(asset.id, [nearestId]);
  pipelineToAssetIds.get(nearestId).push(asset.id);
});

function getConnectedPipelineIds(asset) {
  return assetToPipelineIds.get(asset.id) || [];
}

function getConnectedAssetIds(asset) {
  const pipelineIds = getConnectedPipelineIds(asset);
  const assetIds = new Set();
  pipelineIds.forEach((pipelineId) => {
    (pipelineToAssetIds.get(pipelineId) || []).forEach((id) => {
      if (id !== asset.id) assetIds.add(id);
    });
  });
  return assetIds;
}

/* ------------------------------------------------------------------------ */
/* Icon atlas — SVG data-URI glyphs per asset category                      */
/* ------------------------------------------------------------------------ */

const SHAPE_BUILDERS = {
  plant: (color) => `
    <rect x="5" y="15" width="22" height="11" rx="1.5" fill="${color}" />
    <rect x="8" y="9" width="3.5" height="7" fill="${color}" />
    <rect x="14.25" y="6" width="3.5" height="10" fill="${color}" />
    <rect x="20.5" y="9" width="3.5" height="7" fill="${color}" />
    <rect x="5" y="24" width="22" height="2.5" fill="${color}" opacity="0.6" />
  `,
  pump: (color) => `
    <circle cx="16" cy="16" r="10.5" fill="${color}" />
    <circle cx="16" cy="16" r="4" fill="rgba(0,0,0,0.35)" />
    <rect x="2" y="14" width="5" height="4" rx="1" fill="${color}" />
    <rect x="25" y="14" width="5" height="4" rx="1" fill="${color}" />
  `,
  meter: (color) => `
    <polygon points="16,4 28,16 16,28 4,16" fill="${color}" />
    <circle cx="16" cy="16" r="5.5" fill="rgba(0,0,0,0.3)" />
    <line x1="16" y1="16" x2="20" y2="12" stroke="${color}" stroke-width="2" stroke-linecap="round" />
  `,
  gas: (color) => `
    <rect x="8" y="9" width="13" height="18" rx="2" fill="${color}" />
    <rect x="11" y="13" width="7" height="6" rx="1" fill="rgba(0,0,0,0.3)" />
    <path d="M21 14 Q27 14 27 19 L27 24" stroke="${color}" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <circle cx="27" cy="25.5" r="2" fill="${color}" />
  `,
  construction: (color) => `
    <polygon points="16,3 27,9.5 27,22.5 16,29 5,22.5 5,9.5" fill="${color}" opacity="0.85" />
    <line x1="11" y1="22" x2="11" y2="10" stroke="rgba(0,0,0,0.45)" stroke-width="2" />
    <line x1="11" y1="10" x2="22" y2="10" stroke="rgba(0,0,0,0.45)" stroke-width="2" />
    <line x1="18" y1="10" x2="18" y2="15" stroke="rgba(0,0,0,0.45)" stroke-width="2" />
  `,
};

function rgbToCss([r, g, b]) {
  return `rgb(${r},${g},${b})`;
}

function buildIconSvg(shapeKey, color) {
  const builder = SHAPE_BUILDERS[shapeKey] || SHAPE_BUILDERS.pump;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="15" fill="rgba(0,0,0,0.35)" />
      <circle cx="16" cy="16" r="15" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1" />
      ${builder(rgbToCss(color))}
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const CATEGORY_ICONS = Object.fromEntries(
  Object.entries(CATEGORY_META).map(([category, meta]) => [
    category,
    { url: buildIconSvg(meta.icon, meta.color), width: 32, height: 32, anchorY: 16 },
  ])
);

function getIconForCategory(category) {
  return CATEGORY_ICONS[category];
}

/* ------------------------------------------------------------------------ */
/* Layer toggles / asset filters                                            */
/* ------------------------------------------------------------------------ */

export const LAYER_IDS = { ZONES: 'zones', PIPELINES: 'pipelines', ASSETS: 'assets' };

const DEFAULT_VISIBILITY = {
  [LAYER_IDS.ZONES]: true,
  [LAYER_IDS.PIPELINES]: true,
  [LAYER_IDS.ASSETS]: true,
};

const DEFAULT_FILTERS = Object.values(ASSET_CATEGORIES).reduce((acc, category) => {
  acc[category] = true;
  return acc;
}, {});

/* ------------------------------------------------------------------------ */
/* Live telemetry simulation                                                 */
/* ------------------------------------------------------------------------ */

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function useLiveTelemetry(asset) {
  const [live, setLive] = useState({ pressure: asset.pressure, flowLpm: asset.flowLpm });
  const baseline = useRef(asset);

  useEffect(() => {
    baseline.current = asset;
    setLive({ pressure: asset.pressure, flowLpm: asset.flowLpm });

    const tick = () => {
      const base = baseline.current;
      setLive((prev) => ({
        pressure: Math.round(
          clamp(prev.pressure + (Math.random() - 0.5) * 0.08, base.pressure * 0.92, base.pressure * 1.08) * 100
        ) / 100,
        flowLpm: Math.round(
          clamp(prev.flowLpm + (Math.random() - 0.5) * 0.05 * base.flowLpm, base.flowLpm * 0.94, base.flowLpm * 1.06)
        ),
      }));
    };

    const interval = setInterval(tick, 2000 + Math.random() * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset.id]);

  return live;
}

/* ------------------------------------------------------------------------ */
/* deck.gl layer creators                                                    */
/* ------------------------------------------------------------------------ */

function createZoneLayer({ visible, selectedZoneId = null, onClick }) {
  const hasSelection = Boolean(selectedZoneId);

  return new PolygonLayer({
    id: 'zone-layer',
    data: ZONES,
    visible,
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: true,
    getPolygon: (d) => d.polygon,
    getFillColor: (d) => {
      const base = ZONE_TYPE_META[d.type].fillColor;
      if (d.id === selectedZoneId) return [base[0], base[1], base[2], Math.min(255, base[3] + 70)];
      if (hasSelection) return [base[0], base[1], base[2], Math.max(10, base[3] - 15)];
      return base;
    },
    getLineColor: (d) => ZONE_TYPE_META[d.type].borderColor,
    getLineWidth: (d) => {
      const base = d.type === ZONE_TYPES.ALERT ? 4 : 2;
      return d.id === selectedZoneId ? base + 3 : base;
    },
    lineWidthMinPixels: 2,
    onClick,
    updateTriggers: { getFillColor: selectedZoneId, getLineWidth: selectedZoneId },
  });
}

function createPipelineLayer({ visible, highlightedIds = null }) {
  const hasSelection = Boolean(highlightedIds && highlightedIds.size > 0);

  return new PathLayer({
    id: 'pipeline-layer',
    data: PIPELINES,
    visible,
    pickable: false,
    widthMinPixels: 3,
    getPath: (d) => d.path,
    getColor: (d) => {
      const [r, g, b] = PIPELINE_STATE_META[d.state].color;
      if (!hasSelection) return [r, g, b, 255];
      return highlightedIds.has(d.id) ? [r, g, b, 255] : [r, g, b, 50];
    },
    getWidth: (d) => (hasSelection && highlightedIds.has(d.id) ? 7 : 4),
    capRounded: true,
    jointRounded: true,
    updateTriggers: { getColor: highlightedIds, getWidth: highlightedIds },
  });
}

function createAssetLayer({ visible, filters, onHover, onClick, selectedId = null, emphasizedIds = null }) {
  const data = ASSETS.filter((asset) => filters[asset.category]);
  const hasSelection = Boolean(selectedId);

  return new IconLayer({
    id: 'asset-layer',
    data,
    visible,
    pickable: true,
    getIcon: (d) => getIconForCategory(d.category),
    getPosition: (d) => d.coords,
    getSize: (d) => (d.id === selectedId ? 42 : emphasizedIds?.has(d.id) ? 38 : 32),
    sizeUnits: 'pixels',
    sizeMinPixels: 24,
    sizeMaxPixels: 46,
    getColor: (d) => {
      if (!hasSelection) return [255, 255, 255, 255];
      return d.id === selectedId || emphasizedIds?.has(d.id) ? [255, 255, 255, 255] : [255, 255, 255, 110];
    },
    onHover,
    onClick,
    updateTriggers: {
      getIcon: filters,
      getSize: [selectedId, emphasizedIds],
      getColor: [selectedId, emphasizedIds],
    },
  });
}

const ALARMED_ASSETS = ASSETS.filter((asset) => asset.criticalAlerts > 0);

function createAlarmLayer({ visible, pulsePhase = 0 }) {
  const wave = (Math.sin(pulsePhase * Math.PI * 2) + 1) / 2;

  return new ScatterplotLayer({
    id: 'alarm-layer',
    data: ALARMED_ASSETS,
    visible,
    pickable: false,
    stroked: false,
    filled: true,
    getPosition: (d) => d.coords,
    getRadius: () => 18 + wave * 6,
    radiusUnits: 'pixels',
    getFillColor: (d) => [235, 70, 50, 36 + (d.criticalAlerts >= 3 ? 14 : 0) - wave * 12],
    updateTriggers: { getRadius: pulsePhase, getFillColor: pulsePhase },
  });
}

/* ------------------------------------------------------------------------ */
/* UI sub-components                                                        */
/* ------------------------------------------------------------------------ */

const STATUS_META = {
  [LINK_STATUS.CONNECTED]: { dot: '🟢', className: 'gis-status-badge--connected', label: 'Connected' },
  [LINK_STATUS.DEGRADED]: { dot: '🟡', className: 'gis-status-badge--degraded', label: 'Degraded' },
  [LINK_STATUS.OFFLINE]: { dot: '🔴', className: 'gis-status-badge--offline', label: 'Offline' },
};

function StatusBadge({ status, size = 'md' }) {
  const meta = STATUS_META[status] || STATUS_META[LINK_STATUS.CONNECTED];
  return (
    <span className={`gis-status-badge ${meta.className} gis-status-badge--${size}`}>
      <span className="gis-status-badge__dot" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function Tooltip({ x, y, asset }) {
  return (
    <div className="gis-tooltip" style={{ left: x + 14, top: y + 14 }}>
      <div className="gis-tooltip__title">{asset.label}</div>
      <div className="gis-tooltip__row">
        <span className="gis-tooltip__label">Device:</span> {asset.deviceType}
      </div>
      <div className="gis-tooltip__row">
        <span className="gis-tooltip__label">Latency:</span> {asset.latency} ms
      </div>
      <div className="gis-tooltip__row gis-tooltip__row--status">
        <StatusBadge status={asset.linkStatus} size="sm" />
      </div>
    </div>
  );
}

const TABS = ['Overview', 'Telemetry', 'History', 'Maintenance'];
const TECHNICIANS = ['A. Al Suwaidi', 'R. Mendoza', 'K. Haddad', 'S. Varghese', 'M. Al Naqbi'];

function seeded(id, min, max) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return min + ((hash % 1000) / 1000) * (max - min);
}

function mockMaintenance(asset) {
  const daysToNext = Math.round(seeded(asset.id + 'next', 3, 60));
  const daysSinceLast = Math.round(seeded(asset.id + 'last', 10, 120));
  const technician = TECHNICIANS[Math.floor(seeded(asset.id + 'tech', 0, TECHNICIANS.length))];
  return { daysToNext, daysSinceLast, technician };
}

function mockHistory(asset) {
  const events = [
    { label: 'Telemetry link re-established', kind: 'info' },
    { label: 'Pressure deviation auto-corrected', kind: 'warn' },
    { label: 'Routine calibration completed', kind: 'success' },
    { label: 'Scheduled SCADA poll', kind: 'info' },
  ];
  return events
    .map((event, i) => ({ ...event, daysAgo: Math.round(seeded(asset.id + 'hist' + i, 1, 40)) }))
    .sort((a, b) => a.daysAgo - b.daysAgo);
}

function AssetDetailsContent({ asset }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const live = useLiveTelemetry(asset);
  const categoryMeta = CATEGORY_META[asset.category];
  const icon = getIconForCategory(asset.category);
  const maintenance = mockMaintenance(asset);
  const history = mockHistory(asset);
  const isAlarmed = asset.criticalAlerts > 0;

  return (
    <>
      <div className="gis-asset-popup__hero">
        <img className="gis-asset-popup__icon" src={icon.url} alt="" />
        <div className="gis-asset-popup__hero-text">
          <h2 className="gis-asset-popup__name">{asset.label}</h2>
          <span className="gis-asset-popup__category">{categoryMeta.label}</span>
        </div>
        <StatusBadge status={asset.linkStatus} />
      </div>

      <div className="gis-asset-popup__tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`gis-asset-popup__tab ${activeTab === tab ? 'gis-asset-popup__tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="gis-asset-popup__body">
        {activeTab === 'Overview' && (
          <>
            <div className="gis-asset-popup__kpi-grid">
              <div className="gis-kpi-card">
                <span className="gis-kpi-card__label">Pressure</span>
                <span className="gis-kpi-card__value">
                  {live.pressure.toFixed(1)} <small>bar</small>
                </span>
              </div>
              <div className="gis-kpi-card">
                <span className="gis-kpi-card__label">Flow</span>
                <span className="gis-kpi-card__value">
                  {live.flowLpm.toLocaleString()} <small>L/min</small>
                </span>
              </div>
              <div className="gis-kpi-card">
                <span className="gis-kpi-card__label">Latency</span>
                <span className="gis-kpi-card__value">
                  {asset.latency} <small>ms</small>
                </span>
              </div>
              <div className={`gis-kpi-card ${isAlarmed ? 'gis-kpi-card--alert' : ''}`}>
                <span className="gis-kpi-card__label">Critical Alerts</span>
                <span className="gis-kpi-card__value">{asset.criticalAlerts}</span>
              </div>
            </div>

            <div className="gis-asset-popup__fields">
              <div className="gis-asset-popup__field">
                <span className="gis-asset-popup__field-label">Device Type</span>
                <span className="gis-asset-popup__field-value">{asset.deviceType}</span>
              </div>
              <div className="gis-asset-popup__field">
                <span className="gis-asset-popup__field-label">SAP Location</span>
                <span className="gis-asset-popup__field-value">{asset.sapLocation}</span>
              </div>
              <div className="gis-asset-popup__field">
                <span className="gis-asset-popup__field-label">Region</span>
                <span className="gis-asset-popup__field-value">{asset.region}</span>
              </div>
              <div className="gis-asset-popup__field">
                <span className="gis-asset-popup__field-label">Last Updated</span>
                <span className="gis-asset-popup__field-value">{asset.lastUpdatedMinutesAgo} min ago</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Telemetry' && (
          <div className="gis-asset-popup__telemetry">
            <div className="gis-telemetry-row">
              <span>Live Pressure</span>
              <strong>{live.pressure.toFixed(2)} bar</strong>
            </div>
            <div className="gis-telemetry-row">
              <span>Live Flow</span>
              <strong>{live.flowLpm.toLocaleString()} L/min</strong>
            </div>
            <div className="gis-telemetry-row">
              <span>Output Flow (rated)</span>
              <strong>{asset.outputFlow} m&sup3;/hr</strong>
            </div>
            <div className="gis-telemetry-row">
              <span>Link Latency</span>
              <strong>{asset.latency} ms</strong>
            </div>
            <div className="gis-telemetry-row">
              <span>Connection</span>
              <StatusBadge status={asset.linkStatus} size="sm" />
            </div>
            <p className="gis-asset-popup__hint">Values refresh every 2&ndash;3s to simulate a live SCADA feed.</p>
          </div>
        )}

        {activeTab === 'History' && (
          <ul className="gis-asset-popup__history">
            {history.map((event, i) => (
              <li key={i} className={`gis-history-item gis-history-item--${event.kind}`}>
                <span className="gis-history-item__dot" />
                <span className="gis-history-item__label">{event.label}</span>
                <span className="gis-history-item__time">{event.daysAgo}d ago</span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'Maintenance' && (
          <div className="gis-asset-popup__maintenance">
            <div className="gis-asset-popup__field">
              <span className="gis-asset-popup__field-label">Last Serviced</span>
              <span className="gis-asset-popup__field-value">{maintenance.daysSinceLast} days ago</span>
            </div>
            <div className="gis-asset-popup__field">
              <span className="gis-asset-popup__field-label">Next Maintenance</span>
              <span className="gis-asset-popup__field-value">in {maintenance.daysToNext} days</span>
            </div>
            <div className="gis-asset-popup__field">
              <span className="gis-asset-popup__field-label">Assigned Technician</span>
              <span className="gis-asset-popup__field-value">{maintenance.technician}</span>
            </div>
          </div>
        )}
      </div>

      <button type="button" className="gis-asset-popup__drilldown">
        Drill Down to Asset Details
      </button>
    </>
  );
}

function AssetPopup({ x, y, asset, onClose }) {
  const isAlarmed = asset.criticalAlerts > 0;
  return (
    <div
      className={`gis-asset-popup ${isAlarmed ? 'gis-asset-popup--alarmed' : ''}`}
      style={{ left: x + 18, top: y - 10 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button type="button" className="gis-asset-popup__close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <AssetDetailsContent asset={asset} />
    </div>
  );
}

const ZOOM_STEP = 1;
const MIN_ZOOM = 1;
const MAX_ZOOM = 20;

function MapControls({ viewState, onChangeViewState }) {
  function zoomBy(delta) {
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, viewState.zoom + delta));
    onChangeViewState({ ...viewState, zoom: nextZoom, transitionDuration: 250 });
  }

  return (
    <div className="gis-map-controls">
      <button type="button" className="gis-map-controls__btn" onClick={() => zoomBy(ZOOM_STEP)} title="Zoom In">
        +
      </button>
      <button type="button" className="gis-map-controls__btn" onClick={() => zoomBy(-ZOOM_STEP)} title="Zoom Out">
        &minus;
      </button>
    </div>
  );
}

function ZoneInfoCard({ x, y, zone, onClose }) {
  const stats = getZoneStats(zone);
  const isAlert = zone.type === ZONE_TYPES.ALERT;

  return (
    <div
      className={`gis-zone-card ${isAlert ? 'gis-zone-card--alert' : ''}`}
      style={{ left: x + 18, top: y - 10 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button type="button" className="gis-zone-card__close" onClick={onClose} aria-label="Close">
        ×
      </button>

      <div className="gis-zone-card__header">
        <h3 className="gis-zone-card__name">{zone.name}</h3>
        <span className={`gis-zone-card__type ${isAlert ? 'gis-zone-card__type--alert' : ''}`}>
          {ZONE_TYPE_META[zone.type].label}
        </span>
      </div>
      <span className="gis-zone-card__region">
        {zone.region} &middot; {zone.id}
      </span>

      <div className="gis-zone-card__stats">
        <div className="gis-zone-card__stat">
          <span className="gis-zone-card__stat-value">{stats.assetCount}</span>
          <span className="gis-zone-card__stat-label">Assets in Zone</span>
        </div>
        <div className="gis-zone-card__stat">
          <span className="gis-zone-card__stat-value">
            {stats.onlineCount}/{stats.assetCount}
          </span>
          <span className="gis-zone-card__stat-label">Online</span>
        </div>
        <div className={`gis-zone-card__stat ${stats.alertCount > 0 ? 'gis-zone-card__stat--alert' : ''}`}>
          <span className="gis-zone-card__stat-value">{stats.alertCount}</span>
          <span className="gis-zone-card__stat-label">Active Alerts</span>
        </div>
        <div className="gis-zone-card__stat">
          <span className="gis-zone-card__stat-value">{stats.avgPressure.toFixed(1)}</span>
          <span className="gis-zone-card__stat-label">Avg Pressure (bar)</span>
        </div>
      </div>

      {stats.assetCount === 0 && (
        <p className="gis-zone-card__hint">No monitored assets fall within this zone boundary.</p>
      )}
    </div>
  );
}

const PIPELINE_ROWS = [
  { label: PIPELINE_STATE_META[PIPELINE_STATES.NORMAL].label, color: PIPELINE_STATE_META[PIPELINE_STATES.NORMAL].color },
  { label: PIPELINE_STATE_META[PIPELINE_STATES.RESTRICTION].label, color: PIPELINE_STATE_META[PIPELINE_STATES.RESTRICTION].color },
  { label: PIPELINE_STATE_META[PIPELINE_STATES.STAGNANT].label, color: PIPELINE_STATE_META[PIPELINE_STATES.STAGNANT].color },
];

const ZONE_ROWS = [
  { label: ZONE_TYPE_META[ZONE_TYPES.NORMAL].label, color: ZONE_TYPE_META[ZONE_TYPES.NORMAL].borderColor },
  { label: ZONE_TYPE_META[ZONE_TYPES.ALERT].label, color: ZONE_TYPE_META[ZONE_TYPES.ALERT].borderColor },
];

function Legend() {
  return (
    <div className="gis-legend">
      <h4 className="gis-legend__heading">Asset Types</h4>
      {Object.entries(CATEGORY_META).map(([category, meta]) => (
        <div key={category} className="gis-legend__row">
          <img className="gis-legend__icon" src={getIconForCategory(category).url} alt="" />
          <span>{meta.label}</span>
        </div>
      ))}

      <h4 className="gis-legend__heading gis-legend__heading--spaced">Pipelines</h4>
      {PIPELINE_ROWS.map((item) => (
        <div key={item.label} className="gis-legend__row">
          <span className="gis-legend__line" style={{ backgroundColor: `rgb(${item.color.join(',')})` }} />
          <span>{item.label}</span>
        </div>
      ))}

      <h4 className="gis-legend__heading gis-legend__heading--spaced">Zones</h4>
      {ZONE_ROWS.map((item) => (
        <div key={item.label} className="gis-legend__row">
          <span className="gis-legend__swatch" style={{ backgroundColor: `rgb(${item.color.join(',')})` }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function RegionNav({ onSelect }) {
  return (
    <div className="gis-region-nav">
      {REGIONS.map((region) => (
        <button key={region.id} type="button" className="gis-region-nav__btn" onClick={() => onSelect(region)}>
          {region.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Main GisMap component                                                     */
/* ------------------------------------------------------------------------ */

const INITIAL_VIEW_STATE = {
  longitude: 55.4209,
  latitude: 25.3463,
  zoom: 8,
  pitch: 0,
  bearing: 0,
};

function getPresetViewState(variant, coordinates) {
  if (coordinates) {
    return {
      longitude: coordinates[0],
      latitude: coordinates[1],
      zoom: 12.2,
      pitch: 0,
      bearing: 0,
    };
  }

  switch (variant) {
    case 'dma':
      return { longitude: 55.406, latitude: 25.333, zoom: 9.2, pitch: 0, bearing: 0 };
    case 'simulator':
      return { longitude: 55.392, latitude: 25.324, zoom: 9.5, pitch: 0, bearing: 0 };
    default:
      return INITIAL_VIEW_STATE;
  }
}

const GisMap = forwardRef(function GisMap(
  {
    themeName = 'dark',
    detailsMode = 'popup',
    onAssetSelect,
    showLegend = true,
    showRegionNav = true,
    showZoomControls = true,
    mapVariant = 'network',
    focusCoordinates = null,
  },
  ref
) {
  useInjectGisStyles();

  const theme = THEMES[themeName] || THEMES.dark;
  const [visibility] = useState(DEFAULT_VISIBILITY);
  const [filters] = useState(DEFAULT_FILTERS);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [viewState, setViewState] = useState(() => getPresetViewState(mapVariant, focusCoordinates));
  const containerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((Date.now() % 1600) / 1600);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    onAssetSelect?.(selectedAsset?.asset ?? null);
  }, [selectedAsset, onAssetSelect]);

  useEffect(() => {
    setViewState((prev) => ({ ...prev, ...getPresetViewState(mapVariant, focusCoordinates) }));
  }, [focusCoordinates, mapVariant]);

  function flyTo({ longitude, latitude, zoom, bearing = 0, pitch = 0 }) {
    setSelectedAsset(null);
    setSelectedZone(null);
    setViewState((prev) => ({
      ...prev,
      longitude,
      latitude,
      zoom: zoom ?? prev.zoom,
      bearing,
      pitch,
      transitionDuration: 1600,
      transitionInterpolator: new FlyToInterpolator({ speed: 1.6 }),
    }));
  }

  useImperativeHandle(ref, () => ({
    flyTo,
    flyToAsset(asset) {
      setSelectedAsset(null);
      flyTo({ longitude: asset.coords[0], latitude: asset.coords[1], zoom: 14 });
      const rect = containerRef.current?.getBoundingClientRect();
      const x = rect ? rect.width / 2 : 0;
      const y = rect ? rect.height / 2 : 0;
      window.setTimeout(() => {
        setSelectedAsset({ x, y, asset });
      }, 1600);
    },
    clearSelection() {
      setSelectedAsset(null);
    },
  }));

  const handleHover = (info) => {
    setHoverInfo(info.object ? { x: info.x, y: info.y, asset: info.object } : null);
  };

  const handleClick = (info) => {
    setSelectedAsset(info.object ? { x: info.x, y: info.y, asset: info.object } : null);
  };

  const handleZoneClick = (info) => {
    if (info.object) {
      setSelectedZone((prev) => (prev?.zone.id === info.object.id ? null : { x: info.x, y: info.y, zone: info.object }));
    }
  };

  const connectedPipelineIds = useMemo(() => {
    if (!selectedAsset) return null;
    return new Set(getConnectedPipelineIds(selectedAsset.asset));
  }, [selectedAsset]);

  const connectedAssetIds = useMemo(() => {
    if (!selectedAsset) return null;
    return getConnectedAssetIds(selectedAsset.asset);
  }, [selectedAsset]);

  const zoneLayer = useMemo(
    () =>
      createZoneLayer({
        visible: visibility[LAYER_IDS.ZONES],
        selectedZoneId: selectedZone?.zone.id ?? null,
        onClick: handleZoneClick,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibility, selectedZone]
  );

  const pipelineLayer = useMemo(
    () => createPipelineLayer({ visible: visibility[LAYER_IDS.PIPELINES], highlightedIds: connectedPipelineIds }),
    [visibility, connectedPipelineIds]
  );

  const assetLayer = useMemo(
    () =>
      createAssetLayer({
        visible: visibility[LAYER_IDS.ASSETS],
        filters,
        onHover: handleHover,
        onClick: handleClick,
        selectedId: selectedAsset?.asset.id ?? null,
        emphasizedIds: connectedAssetIds,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibility, filters, selectedAsset, connectedAssetIds]
  );

  const alarmLayer = useMemo(
    () => createAlarmLayer({ visible: visibility[LAYER_IDS.ASSETS], pulsePhase }),
    [visibility, pulsePhase]
  );

  const layers = [zoneLayer, pipelineLayer, alarmLayer, assetLayer];

  return (
    <div className="gis-map" style={themeCssVars(theme)}>
      <div
        className="gis-map__canvas"
        ref={containerRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedAsset(null);
            setSelectedZone(null);
          }
        }}
      >
        <DeckGL
          viewState={viewState}
          onViewStateChange={({ viewState: nextViewState }) => setViewState(nextViewState)}
          controller={true}
          layers={layers}
          onClick={(info) => {
            if (!info.object) {
              setSelectedAsset(null);
              setSelectedZone(null);
            }
          }}
        >
          <MaplibreMap mapStyle={theme.mapStyle} reuseMaps />
        </DeckGL>

        {showZoomControls && <MapControls viewState={viewState} onChangeViewState={setViewState} />}
        {showRegionNav && <RegionNav onSelect={flyTo} />}
        {showLegend && <Legend />}

        {hoverInfo && !selectedAsset && <Tooltip x={hoverInfo.x} y={hoverInfo.y} asset={hoverInfo.asset} />}

        {selectedAsset && detailsMode === 'popup' && (
          <AssetPopup
            x={selectedAsset.x}
            y={selectedAsset.y}
            asset={selectedAsset.asset}
            onClose={() => setSelectedAsset(null)}
          />
        )}

        {selectedZone && (
          <ZoneInfoCard
            x={selectedZone.x}
            y={selectedZone.y}
            zone={selectedZone.zone}
            onClose={() => setSelectedZone(null)}
          />
        )}
      </div>
    </div>
  );
});

export default GisMap;
