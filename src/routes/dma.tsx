import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/AppShell";
import { useApp } from "@/lib/app-context";
import { diurnal } from "@/lib/mock-data";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Legend,
} from "recharts";
import type { TooltipProps } from "recharts";
import {
  CHART_COLORS,
  CHART_GRID_PROPS,
  CHART_AXIS_PROPS,
  CHART_LEGEND_PROPS,
  CHART_AXIS,
} from "@/lib/chart-theme";
import { GisMapClient } from "@/GIS/GisMapClient";

export const Route = createFileRoute("/dma")({
  head: () => ({ meta: [{ title: "DMA Water Audit & Leakage Ledger · Project WAVE" }] }),
  component: DmaPage,
});

const DMAS = [
  { id: "DMA-014", name: "Al Muwaileh North", nrw: 8.4, mnf: 42, cons: 3800 },
  { id: "DMA-021", name: "Al Nahda West", nrw: 12.6, mnf: 78, cons: 5200 },
  { id: "DMA-033", name: "Al Khan Corniche", nrw: 5.2, mnf: 22, cons: 2400 },
  { id: "DMA-044", name: "Industrial Zone 4", nrw: 18.9, mnf: 132, cons: 8100 },
  { id: "DMA-052", name: "University City", nrw: 6.1, mnf: 31, cons: 3100 },
];

function DivergenceTooltip({ active, label, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const predicted = payload.find((p) => p.dataKey === "predicted")?.value;
  const actual = payload.find((p) => p.dataKey === "actual")?.value;
  const gap = Number(payload.find((p) => p.dataKey === "gapAmount")?.value ?? 0);
  return (
    <div
      style={{
        background: "var(--chart-tooltip-bg)",
        border: "1px solid var(--chart-tooltip-border)",
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 11,
        color: "var(--chart-tooltip-text)",
        minWidth: 160,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ color: CHART_COLORS.gold }}>
        Twin predicted: {predicted?.toLocaleString()} m³
      </div>
      <div style={{ color: CHART_COLORS.blue }}>Boundary flow: {actual?.toLocaleString()} m³</div>
      {gap > 0 && (
        <div style={{ color: CHART_COLORS.warning, marginTop: 4, fontWeight: 700 }}>
          ⚠ MNF divergence: +{gap} m³/hr
        </div>
      )}
    </div>
  );
}

function DmaPage() {
  const { t } = useApp();
  const data = diurnal(48, 11);
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t("nav_dma")}
        subtitle="Mass-balance NRW analytics · Minimum Night Flow anomaly detection · IWA best practice"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="panel p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            NRW Emirate-wide
          </div>
          <div className="mt-1 text-2xl font-mono">
            10.4<span className="text-[11px] text-muted-foreground ms-1">%</span>
          </div>
          <div className="text-[10.5px] text-ok mt-1">-1.2 pts vs Q1</div>
        </div>
        <div className="panel p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Total DMAs Tracked
          </div>
          <div className="mt-1 text-2xl font-mono">184</div>
          <div className="text-[10.5px] text-muted-foreground mt-1">6 above alarm threshold</div>
        </div>
        <div className="panel p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Estimated Losses
          </div>
          <div className="mt-1 text-2xl font-mono">
            42,180<span className="text-[11px] text-muted-foreground ms-1">m³/d</span>
          </div>
          <div className="text-[10.5px] text-warn mt-1">≈ AED 118K/day</div>
        </div>
        <div className="panel p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Active Leak Investigations
          </div>
          <div className="mt-1 text-2xl font-mono">7</div>
          <div className="text-[10.5px] text-muted-foreground mt-1">Field crews dispatched</div>
        </div>
      </div>

      <Panel
        accent
        title="Boundary Flow vs Digital-Twin Predicted Demand — DMA-044 Industrial Zone 4"
        right={<span className="text-[10px] text-warn font-mono">⚠ MNF DIVERGENCE +32 m³/hr</span>}
      >
        <div className="h-72">
          <ResponsiveContainer>
            <ComposedChart data={data}>
              <CartesianGrid {...CHART_GRID_PROPS} />
              <XAxis dataKey="t" {...CHART_AXIS_PROPS} interval={3} />
              <YAxis {...CHART_AXIS_PROPS} unit=" m³" width={55} />
              <Tooltip content={<DivergenceTooltip />} />
              <Legend {...CHART_LEGEND_PROPS} />
              <ReferenceArea
                x1="02:00"
                x2="04:00"
                fill={CHART_COLORS.windowMarker}
                stroke={CHART_COLORS.windowMarkerStroke}
                strokeDasharray="3 3"
                label={{ value: t("mnf"), position: "insideTop", fill: CHART_AXIS, fontSize: 10 }}
              />
              {/* Divergence band — stacked invisible base + visible amber fill, so
                  the shading sits exactly between the two curves (only where
                  actual exceeds predicted inside the MNF window). */}
              <Area
                dataKey="gapBase"
                stackId="divergence"
                stroke="none"
                fill="transparent"
                legendType="none"
                isAnimationActive={false}
                tooltipType="none"
              />
              <Area
                dataKey="gapAmount"
                name="MNF leak divergence"
                stackId="divergence"
                stroke="none"
                fill={CHART_COLORS.divergenceFill}
                legendType="none"
                isAnimationActive={false}
                tooltipType="none"
              />
              <Line
                type="monotone"
                name="Twin predicted demand"
                dataKey="predicted"
                stroke={CHART_COLORS.gold}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
              />
              <Line
                type="monotone"
                name="Boundary flow (actual)"
                dataKey="actual"
                stroke={CHART_COLORS.blue}
                strokeWidth={2.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="District Leakage Ledger">
        <div className="mb-4 h-72 overflow-hidden rounded border border-border/70">
          <GisMapClient mapVariant="dma" showRegionNav={false} showLegend={false} focusCoordinates={[55.405, 25.333]} />
        </div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="text-start pb-2 font-medium">DMA</th>
              <th className="text-start pb-2 font-medium">Name</th>
              <th className="text-end pb-2 font-medium">NRW %</th>
              <th className="text-end pb-2 font-medium">MNF (m³/hr)</th>
              <th className="text-end pb-2 font-medium">Daily Consumption</th>
              <th className="text-end pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {DMAS.map((d) => (
              <tr key={d.id} className="border-t border-border/50 hover:bg-primary/5">
                <td className="py-2.5 font-mono text-accent text-[11.5px]">{d.id}</td>
                <td className="py-2.5">{d.name}</td>
                <td
                  className={`py-2.5 text-end font-mono ${d.nrw > 15 ? "text-crit" : d.nrw > 10 ? "text-warn" : "text-ok"}`}
                >
                  {d.nrw}%
                </td>
                <td className="py-2.5 text-end font-mono">{d.mnf}</td>
                <td className="py-2.5 text-end font-mono">{d.cons.toLocaleString()} m³</td>
                <td className="py-2.5 text-end">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${d.nrw > 15 ? "bg-crit/20 text-crit" : d.nrw > 10 ? "bg-warn/20 text-warn" : "bg-ok/20 text-ok"}`}
                  >
                    {d.nrw > 15 ? "INVESTIGATE" : d.nrw > 10 ? "WATCH" : "NOMINAL"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
