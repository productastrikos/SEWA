// Shared Recharts theming — every chart in the app should pull grid, axis,
// tooltip, and line colors from here instead of inlining `var(--color-*)`
// tokens. Those Tailwind theme tokens are aliases for panel/button chrome
// (--ds-border is transparent by design; --ds-btn is near-black), which is
// why charts previously rendered as invisible lines on a black canvas.
// The --chart-* CSS custom properties this reads from are defined per-theme
// in styles.css.

export const CHART_GRID = "var(--chart-grid)";
export const CHART_AXIS = "var(--chart-axis)";

export const CHART_COLORS = {
  gold: "var(--chart-line-gold)",
  blue: "var(--chart-line-blue)",
  purple: "var(--chart-line-purple)",
  success: "var(--ds-success)",
  warning: "var(--ds-warning)",
  danger: "var(--ds-danger)",
  info: "var(--ds-info)",
  divergenceFill: "var(--chart-divergence-fill)",
  windowMarker: "var(--chart-window-marker)",
  windowMarkerStroke: "var(--chart-window-marker-stroke)",
} as const;

// Common CartesianGrid props — spread onto <CartesianGrid {...CHART_GRID_PROPS} />
export const CHART_GRID_PROPS = {
  stroke: CHART_GRID,
  strokeDasharray: "2 2",
} as const;

// Common axis props — spread onto <XAxis {...CHART_AXIS_PROPS} .../>
export const CHART_AXIS_PROPS = {
  stroke: CHART_AXIS,
  fontSize: 10,
  tick: { fill: CHART_AXIS },
} as const;

// Tooltip surface + text styling — legibility was the core bug (dark bg,
// default black item/label text). contentStyle only styles the wrapper div;
// itemStyle/labelStyle are required to actually color the text inside it.
export const CHART_TOOLTIP_PROPS = {
  contentStyle: {
    background: "var(--chart-tooltip-bg)",
    border: "1px solid var(--chart-tooltip-border)",
    borderRadius: 8,
    fontSize: 11,
  },
  itemStyle: { color: "var(--chart-tooltip-text)" },
  labelStyle: { color: "var(--chart-tooltip-text)", fontWeight: 600, marginBottom: 4 },
  cursor: { stroke: CHART_GRID },
} as const;

export const CHART_LEGEND_PROPS = {
  wrapperStyle: { fontSize: 11, color: CHART_AXIS },
} as const;
