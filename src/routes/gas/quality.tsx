import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/AppShell";
import { useApp } from "@/lib/app-context";
import { series, GAS_QUALITY_SAMPLES } from "@/lib/mock-data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AlertTriangle, X } from "@/lib/icons";
import { useState } from "react";
import { toast } from "sonner";
import { CHART_COLORS, CHART_GRID_PROPS, CHART_AXIS_PROPS, CHART_TOOLTIP_PROPS, CHART_LEGEND_PROPS } from "@/lib/chart-theme";

export const Route = createFileRoute("/gas/quality")({
  head: () => ({ meta: [{ title: "Gas Quality & Odorization · Project WAVE" }] }),
  component: GasQualityPage,
});

function buildOverlay(seed: number, base: number, amp: number) {
  return series(48, base, amp, seed).map((p, i) => ({
    ...p,
    lims: i % 6 === 0 ? +(base + Math.sin(i) * amp * 0.6 + (seed % 3) * 0.02).toFixed(3) : null,
  }));
}

function GasQualityPage() {
  const { t } = useApp();
  const [sapOpen, setSapOpen] = useState(false);
  const odorant = buildOverlay(23, 18.0, 1.4);
  const calorific = buildOverlay(41, 38.2, 0.5);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t("nav_gas_quality")}
        subtitle="Cross-validation of continuous analyzers vs lab grab samples · GCC gas quality standard compliance"
        actions={<span className="text-[10px] px-2 py-1 rounded bg-ok/20 text-ok border border-ok/40 font-mono">GCC-STD GAS-11 · IN COMPLIANCE</span>}
      />

      <div className="panel-accent p-4 flex items-center gap-3 border-warn/50">
        <div className="w-10 h-10 rounded bg-warn/20 grid place-items-center alarm-pulse">
          <AlertTriangle className="w-5 h-5 text-warn" />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-medium">{t("labWarn")} — Odorant Analyzer OD-STN3-01</div>
          <div className="text-[11px] text-muted-foreground">
            Field odorant concentration reads 12.4 mg/m³ vs lab grab sample 18.0 mg/m³ (Δ -31%). Injection pump calibration drift beyond tolerance.
          </div>
        </div>
        <button onClick={() => setSapOpen(true)} className="px-3 py-2 rounded bg-warn text-background text-[11.5px] font-medium">
          Draft Maintenance Order
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Panel title="Odorant Concentration · Field Analyzer vs Lab Grab · Station-3">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={odorant}>
                <CartesianGrid {...CHART_GRID_PROPS} />
                <XAxis dataKey="t" {...CHART_AXIS_PROPS} interval={5} />
                <YAxis {...CHART_AXIS_PROPS} unit=" mg/m³" width={55} domain={[10, 22]} />
                <Tooltip {...CHART_TOOLTIP_PROPS} />
                <Legend {...CHART_LEGEND_PROPS} />
                <Line type="monotone" dataKey="v" name="Field analyzer (2s)" stroke={CHART_COLORS.gold} strokeWidth={1.5} dot={false} />
                <Line dataKey="lims" name="Lab grab sample" stroke={CHART_COLORS.blue} strokeWidth={0} dot={{ r: 5, fill: CHART_COLORS.blue }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Calorific Value · Continuous vs Lab · Station-1">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={calorific}>
                <CartesianGrid {...CHART_GRID_PROPS} />
                <XAxis dataKey="t" {...CHART_AXIS_PROPS} interval={5} />
                <YAxis {...CHART_AXIS_PROPS} unit=" MJ/m³" width={55} domain={[36, 40]} />
                <Tooltip {...CHART_TOOLTIP_PROPS} />
                <Legend {...CHART_LEGEND_PROPS} />
                <Line type="monotone" dataKey="v" name="Continuous chromatograph" stroke={CHART_COLORS.purple} strokeWidth={1.5} dot={false} />
                <Line dataKey="lims" name="Lab grab" stroke={CHART_COLORS.blue} strokeWidth={0} dot={{ r: 5, fill: CHART_COLORS.blue }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Gas Quality Sample Registry — Last 24h">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="text-start pb-2">Sample ID</th>
              <th className="text-start pb-2">Site</th>
              <th className="text-end pb-2">Odorant (mg/m³)</th>
              <th className="text-end pb-2">Calorific (MJ/m³)</th>
              <th className="text-end pb-2">Moisture (%)</th>
              <th className="text-end pb-2">Field Δ</th>
              <th className="text-end pb-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {GAS_QUALITY_SAMPLES.map((r) => (
              <tr key={r.id} className="border-t border-border/50">
                <td className="py-2 font-mono text-accent text-[11px]">{r.id}</td>
                <td>{r.site}</td>
                <td className="text-end font-mono">{r.odorant}</td>
                <td className="text-end font-mono">{r.calorific}</td>
                <td className="text-end font-mono">{r.moisture}</td>
                <td className="text-end font-mono">{r.delta}</td>
                <td className="text-end">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${r.flag === "OK" ? "bg-ok/20 text-ok" : "bg-warn/20 text-warn"}`}>{r.flag}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {sapOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm grid place-items-center z-50 p-4" onClick={() => setSapOpen(false)}>
          <div className="panel-accent max-w-lg w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-accent font-mono">Maintenance Ledger · Draft Work Order</div>
                <div className="text-lg font-semibold mt-1">WO-GAS-2287 (draft)</div>
              </div>
              <button onClick={() => setSapOpen(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <dl className="space-y-2 text-[12px]">
              <div className="flex justify-between border-b border-border pb-1.5">
                <dt className="text-muted-foreground">Equipment</dt>
                <dd className="font-mono">OD-STN3-01</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <dt className="text-muted-foreground">Type</dt>
                <dd>Calibration · PM-Gas-04</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <dt className="text-muted-foreground">Priority</dt>
                <dd className="text-warn">P2 · within 24h</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <dt className="text-muted-foreground">Assigned Crew</dt>
                <dd>Sharjah Instrumentation Team</dd>
              </div>
              <div className="border-b border-border pb-1.5">
                <dt className="text-muted-foreground mb-1">Description (auto-generated)</dt>
                <dd className="text-[11.5px] leading-relaxed">
                  Odorant analyzer OD-STN3-01 shows -31% divergence from lab grab sample 2026-07-03 13:42. Perform 2-point calibration per SOP-GAS-118. Verify odorant reservoir level and injection line integrity.
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => setSapOpen(false)} className="px-3 py-1.5 rounded border border-border text-[11.5px]">Cancel</button>
              <button
                onClick={() => {
                  setSapOpen(false);
                  toast.success("Maintenance WO-GAS-2287 submitted");
                }}
                className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-[11.5px]"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
