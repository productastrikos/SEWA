import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/AppShell";
import { useApp } from "@/lib/app-context";
import { series } from "@/lib/mock-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts";
import { AlertTriangle, FlaskConical, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  CHART_COLORS,
  CHART_GRID_PROPS,
  CHART_AXIS_PROPS,
  CHART_TOOLTIP_PROPS,
  CHART_LEGEND_PROPS,
} from "@/lib/chart-theme";

export const Route = createFileRoute("/quality")({
  head: () => ({ meta: [{ title: "Water Quality & LIMS Compliance · Project WAVE" }] }),
  component: QualityPage,
});

function buildOverlay(seed: number, base: number, amp: number) {
  return series(48, base, amp, seed).map((p, i) => ({
    ...p,
    lims: i % 6 === 0 ? +(base + Math.sin(i) * amp * 0.6 + (seed % 3) * 0.02).toFixed(3) : null,
  }));
}

function QualityPage() {
  const { t } = useApp();
  const [sapOpen, setSapOpen] = useState(false);
  const cl = buildOverlay(21, 0.62, 0.06);
  const tu = buildOverlay(37, 0.18, 0.05);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t("nav_quality")}
        subtitle="Cross-validation of continuous analyzers vs LIMS grab samples · WHO/GCC-standard compliance"
        actions={
          <span className="text-[10px] px-2 py-1 rounded bg-ok/20 text-ok border border-ok/40 font-mono">
            GCC-STD 149 · IN COMPLIANCE
          </span>
        }
      />

      <div className="panel-accent p-4 flex items-center gap-3 border-warn/50">
        <div className="w-10 h-10 rounded bg-warn/20 grid place-items-center alarm-pulse">
          <AlertTriangle className="w-5 h-5 text-warn" />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-medium">{t("labWarn")} — Analyzer CL-KFRRO-04</div>
          <div className="text-[11px] text-muted-foreground">
            Field chlorine reads 0.61 mg/L vs LIMS grab sample 0.72 mg/L (Δ +18%). Calibration drift
            beyond ISO-15839 tolerance.
          </div>
        </div>
        <button
          onClick={() => setSapOpen(true)}
          className="px-3 py-2 rounded bg-warn text-background text-[11.5px] font-medium"
        >
          {t("draftSap")}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Panel title="Free Chlorine · Field Analyzer vs LIMS Grab · KFRRO (Khorfakkan)">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={cl}>
                <CartesianGrid {...CHART_GRID_PROPS} />
                <XAxis dataKey="t" {...CHART_AXIS_PROPS} interval={5} />
                <YAxis {...CHART_AXIS_PROPS} unit=" mg/L" width={55} domain={[0.4, 0.9]} />
                <Tooltip {...CHART_TOOLTIP_PROPS} />
                <Legend {...CHART_LEGEND_PROPS} />
                <Line
                  type="monotone"
                  dataKey="v"
                  name="Field analyzer (2s)"
                  stroke={CHART_COLORS.blue}
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  dataKey="lims"
                  name="LIMS grab sample"
                  stroke={CHART_COLORS.gold}
                  strokeWidth={0}
                  dot={{ r: 5, fill: CHART_COLORS.gold }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Turbidity · Continuous vs LIMS · RHMRO (Sharjah)">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={tu}>
                <CartesianGrid {...CHART_GRID_PROPS} />
                <XAxis dataKey="t" {...CHART_AXIS_PROPS} interval={5} />
                <YAxis {...CHART_AXIS_PROPS} unit=" NTU" width={55} domain={[0, 0.5]} />
                <Tooltip {...CHART_TOOLTIP_PROPS} />
                <Legend {...CHART_LEGEND_PROPS} />
                <Line
                  type="monotone"
                  dataKey="v"
                  name="Continuous turbidimeter"
                  stroke={CHART_COLORS.purple}
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  dataKey="lims"
                  name="LIMS grab"
                  stroke={CHART_COLORS.gold}
                  strokeWidth={0}
                  dot={{ r: 5, fill: CHART_COLORS.gold }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="LIMS Sample Registry — Last 24h">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="text-start pb-2">Sample ID</th>
              <th className="text-start pb-2">Site</th>
              <th className="text-end pb-2">Free Cl (mg/L)</th>
              <th className="text-end pb-2">Turb (NTU)</th>
              <th className="text-end pb-2">pH</th>
              <th className="text-end pb-2">Field Δ</th>
              <th className="text-end pb-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                id: "LIMS-2026-08411",
                site: "KFRRO",
                cl: 0.72,
                tu: 0.14,
                ph: 7.4,
                delta: "+18%",
                flag: "DRIFT",
              },
              {
                id: "LIMS-2026-08410",
                site: "ZBRPS",
                cl: 0.61,
                tu: 0.09,
                ph: 7.6,
                delta: "+2%",
                flag: "OK",
              },
              {
                id: "LIMS-2026-08409",
                site: "HMYRO",
                cl: 0.68,
                tu: 0.11,
                ph: 7.5,
                delta: "-3%",
                flag: "OK",
              },
              {
                id: "LIMS-2026-08408",
                site: "BDAPS",
                cl: 0.74,
                tu: 0.08,
                ph: 7.6,
                delta: "+1%",
                flag: "OK",
              },
              {
                id: "LIMS-2026-08407",
                site: "KLBDS",
                cl: 0.65,
                tu: 0.16,
                ph: 7.4,
                delta: "+4%",
                flag: "OK",
              },
            ].map((r) => (
              <tr key={r.id} className="border-t border-border/50">
                <td className="py-2 font-mono text-accent text-[11px]">{r.id}</td>
                <td>{r.site}</td>
                <td className="text-end font-mono">{r.cl}</td>
                <td className="text-end font-mono">{r.tu}</td>
                <td className="text-end font-mono">{r.ph}</td>
                <td className="text-end font-mono">{r.delta}</td>
                <td className="text-end">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${r.flag === "OK" ? "bg-ok/20 text-ok" : "bg-warn/20 text-warn"}`}
                  >
                    {r.flag}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {sapOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm grid place-items-center z-50 p-4"
          onClick={() => setSapOpen(false)}
        >
          <div className="panel-accent max-w-lg w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-accent font-mono">
                  SAP CMMS · Draft Work Order
                </div>
                <div className="text-lg font-semibold mt-1">WO-4482237 (draft)</div>
              </div>
              <button onClick={() => setSapOpen(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <dl className="space-y-2 text-[12px]">
              <div className="flex justify-between border-b border-border pb-1.5">
                <dt className="text-muted-foreground">Equipment</dt>
                <dd className="font-mono">CL-KFRRO-04</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <dt className="text-muted-foreground">Type</dt>
                <dd>Calibration · PM-04</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <dt className="text-muted-foreground">Priority</dt>
                <dd className="text-warn">P2 · within 24h</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-1.5">
                <dt className="text-muted-foreground">Assigned Crew</dt>
                <dd>Khorfakkan Instrumentation Team</dd>
              </div>
              <div className="border-b border-border pb-1.5">
                <dt className="text-muted-foreground mb-1">Description (auto-generated)</dt>
                <dd className="text-[11.5px] leading-relaxed">
                  Chlorine analyzer CL-KFRRO-04 shows +18% divergence from LIMS grab sample
                  2026-07-03 13:42. Perform 2-point calibration per SOP-QA-118. Verify reagent
                  expiry and sample line integrity.
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setSapOpen(false)}
                className="px-3 py-1.5 rounded border border-border text-[11.5px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSapOpen(false);
                  toast.success("SAP WO-4482237 submitted to CMMS");
                }}
                className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-[11.5px]"
              >
                Submit to SAP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
