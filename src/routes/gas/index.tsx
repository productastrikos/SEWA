import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/AppShell";
import { useApp } from "@/lib/app-context";
import { GAS_ASSETS, GAS_ALARMS, GAS_KPI, GAS_AUDIT_ZONES, GAS_SOP_OPTIONS, series } from "@/lib/mock-data";
import { AlertTriangle, Flame, Activity, Wifi, ArrowUpRight, TrendingDown } from "@/lib/icons";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { GisMapClient } from "@/GIS/GisMapClient";

export const Route = createFileRoute("/gas/")({
  head: () => ({
    meta: [
      { title: "Gas Network Navigation Hub · Project WAVE" },
      {
        name: "description",
        content: "Real-time SEWA natural gas network telemetry, alarms, and GIS overview.",
      },
    ],
  }),
  component: GasHubPage,
});

type RagTone = "success" | "warning" | "danger" | "info";

function KpiCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  trendDir = "up",
  rag,
  ragLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  trend: string;
  trendDir?: "up" | "down";
  rag: RagTone;
  ragLabel: string;
}) {
  const trendGood = trendDir === "up";
  return (
    <div
      className="kpi-lift p-5 flex flex-col"
      style={{ background: "var(--ds-surface)", border: "1px solid var(--ds-panel-border)", borderRadius: 16 }}
    >
      <div className="flex items-start justify-between">
        <div className="w-7 h-7 grid place-items-center" style={{ background: "var(--ds-accent-bg)", color: "var(--ds-accent)", borderRadius: 8 }}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <div
            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold"
            style={{
              background: trendGood ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              color: trendGood ? "var(--ds-success)" : "var(--ds-danger)",
              borderRadius: 6,
            }}
          >
            {trendGood ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
          <span className="text-[9px] font-medium" style={{ color: "var(--ds-text-faint)" }}>vs previous 24h</span>
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span style={{ color: "var(--ds-text)", fontSize: "clamp(1.4rem, 3vw, 2.2rem)", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.01em" }}>
          {value}
        </span>
        <span className="text-[12px] font-medium" style={{ color: "var(--ds-text-faint)" }}>{unit}</span>
      </div>
      <div className="mt-1 text-[14px] truncate" style={{ color: "var(--ds-text-muted)" }}>{label}</div>
      <div className="mt-3 h-8 -mx-1">
        <ResponsiveContainer>
          <AreaChart data={series(30, 100, 12, label.length)}>
            <Area dataKey="v" stroke="var(--ds-chart-primary)" strokeWidth={1.5} fill="var(--ds-chart-primary)" fillOpacity={0.12} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <span
          className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold"
          style={{
            background: `var(--ds-${rag}-bg)`,
            color: `var(--ds-${rag})`,
            border: `1px solid var(--ds-${rag}-border)`,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderRadius: 999,
            lineHeight: 1,
          }}
        >
          {ragLabel}
        </span>
        <span className="text-[10px]" style={{ color: "var(--ds-text-faint)" }}>Last · 12s ago</span>
      </div>
    </div>
  );
}

function GasStationStrip() {
  const chips: Array<{ label: string; count: number; tone: RagTone }> = [
    { label: "Healthy", count: GAS_ASSETS.filter((a) => a.commissioned && a.status === "healthy").length, tone: "success" },
    { label: "Warning", count: GAS_ASSETS.filter((a) => a.commissioned && a.status === "warn").length, tone: "warning" },
    { label: "Critical", count: GAS_ASSETS.filter((a) => a.commissioned && a.status === "crit").length, tone: "danger" },
    { label: "Commissioning", count: GAS_ASSETS.filter((a) => !a.commissioned).length, tone: "info" },
  ];
  return (
    <div className="flex gap-2 text-[10px] mb-3">
      {chips.map((c) => (
        <span
          key={c.label}
          className="inline-flex items-center gap-1.5 px-2 py-1 font-semibold"
          style={{ background: `var(--ds-${c.tone}-bg)`, color: `var(--ds-${c.tone})`, border: `1px solid var(--ds-${c.tone}-border)`, borderRadius: 6, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: 10 }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: `var(--ds-${c.tone})` }} />
          {c.label} · {c.count}
        </span>
      ))}
    </div>
  );
}

function GasHubPage() {
  const { t, lang, theme, openAlertPanel } = useApp();
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader title={t("nav_gas_hub")} subtitle="GIS-integrated gas network telemetry · Live SCADA · Sub-second alarm queue" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Flame} label="Total Network Throughput" value={GAS_KPI.totalThroughput.toLocaleString()} unit="m³/hr" trend="+1.8%" trendDir="up" rag="success" ragLabel="Within target" />
        <KpiCard icon={AlertTriangle} label={t("critical")} value={String(GAS_KPI.criticalCount)} unit="active" trend="+1" trendDir="down" rag="danger" ragLabel="Breach" />
        <KpiCard icon={Wifi} label={t("availability")} value={String(GAS_KPI.availability)} unit="%" trend="+0.05%" trendDir="up" rag="success" ragLabel="Normal" />
        <KpiCard icon={Activity} label="Network Pressure Stability" value={String(GAS_KPI.networkPressureStability)} unit="%" trend="-0.2%" trendDir="down" rag="warning" ragLabel="At threshold" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Panel
            title="Interactive GIS — Gas Distribution Network"
            right={<div className="text-[10px]" style={{ color: "var(--ds-text-faint)" }}>{GAS_ASSETS.length} coded facilities · {GAS_AUDIT_ZONES.length} zones</div>}
          >
            <GasStationStrip />
            <div className="relative h-[440px] overflow-hidden" style={{ background: "var(--ds-surface-soft)", borderRadius: 10 }}>
              <GisMapClient themeName={theme === "dark" ? "dark" : "light"} />
            </div>
          </Panel>
        </div>

        <Panel
          title={t("activeShift")}
          right={
            <span className="text-[10px] px-2 py-0.5 font-bold" style={{ background: "var(--ds-danger-bg)", color: "var(--ds-danger)", border: "1px solid var(--ds-danger-border)", borderRadius: 999, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Live
            </span>
          }
        >
          <div className="space-y-1.5 max-h-[440px] overflow-auto -mx-1 pe-1">
            {GAS_ALARMS.map((a) => {
              const tone: RagTone = a.severity === 1 ? "danger" : a.severity === 2 ? "warning" : "info";
              return (
                <div
                  key={a.id}
                  onClick={() => openAlertPanel({ alarm: a, sectorLabel: "Gas", sopOptions: GAS_SOP_OPTIONS })}
                  role="button"
                  tabIndex={0}
                  className={`flex items-start gap-3 p-2.5 cursor-pointer transition hover:brightness-125 ${!a.ack ? "isa-unack-ring" : ""}`}
                  style={{ background: a.severity === 1 && !a.ack ? "var(--ds-danger-bg)" : "var(--ds-surface-soft)", borderRadius: 8, borderInlineStart: `2px solid var(--ds-${tone})` }}
                >
                  <div className="mt-0.5 w-7 h-6 grid place-items-center text-[10px] font-bold shrink-0" style={{ background: `var(--ds-${tone}-bg)`, color: `var(--ds-${tone})`, borderRadius: 6 }}>
                    S{a.severity}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!a.ack && <AlertTriangle className="w-3 h-3 shrink-0" style={{ color: "var(--ds-warning)" }} />}
                      <span className="text-[11px]" style={{ color: "var(--ds-text-faint)" }}>{a.ts}</span>
                      <span className="text-[11px] font-semibold" style={{ color: "var(--ds-text)" }}>{a.asset}</span>
                      {a.ack && (
                        <span className="text-[9px] px-1.5 py-0.5 font-bold" style={{ background: "var(--ds-surface-raised)", color: "var(--ds-text-faint)", borderRadius: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                          Ack
                        </span>
                      )}
                    </div>
                    <div className="text-[12.5px] mt-0.5 truncate" style={{ color: "var(--ds-text-muted)" }}>
                      {lang === "ar" ? a.descriptionAr : a.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
