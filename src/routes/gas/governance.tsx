import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/AppShell";
import { useApp } from "@/lib/app-context";
import { series, GAS_ASSETS } from "@/lib/mock-data";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { Clock, Shield, Database } from "@/lib/icons";
import { CHART_COLORS, CHART_GRID_PROPS, CHART_AXIS_PROPS, CHART_TOOLTIP_PROPS } from "@/lib/chart-theme";

export const Route = createFileRoute("/gas/governance")({
  head: () => ({ meta: [{ title: "Gas Governance, Security & System Health · Project WAVE" }] }),
  component: GasGovPage,
});

function Metric({ icon: Icon, label, value, unit, tone, hint }: any) {
  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-mono tabular-nums">
            {value}
            <span className="text-[11px] text-muted-foreground ms-1">{unit}</span>
          </div>
          <div className={`text-[10.5px] mt-1 ${tone}`}>{hint}</div>
        </div>
        <Icon className="w-5 h-5 text-accent" />
      </div>
    </div>
  );
}

function GasGovPage() {
  const { t } = useApp();
  const commissioned = GAS_ASSETS.filter((a) => a.commissioned).length;
  return (
    <div className="p-6 space-y-6">
      <PageHeader title={t("nav_gas_gov")} subtitle="OT/IT boundary telemetry · IEC-62443 conformance · Purdue Level 2 ↔ 3 monitoring" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric icon={Clock} label={t("ptp")} value="0.51" unit="ms" tone="text-ok" hint="Within IEEE-1588 Class B (±1 μs class ok)" />
        <Metric icon={Shield} label={t("firewall")} value="612" unit="/hr" tone="text-warn" hint="9% above baseline — investigate" />
        <Metric icon={Database} label={t("replication")} value="142" unit="ms" tone="text-ok" hint="Primary ↔ DR async replication" />
        <Metric icon={Shield} label="IDS Signatures" value="31,204" unit="rules" tone="text-info" hint="Updated 03:12 UTC" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Panel title="PTP Master Clock Drift · 24h" accent>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={series(96, 0.5, 0.15, 5)}>
                <defs>
                  <linearGradient id="gasptp" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.gold} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_COLORS.gold} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...CHART_GRID_PROPS} />
                <XAxis dataKey="t" {...CHART_AXIS_PROPS} interval={11} />
                <YAxis {...CHART_AXIS_PROPS} unit="ms" width={40} />
                <Tooltip {...CHART_TOOLTIP_PROPS} />
                <Area type="monotone" dataKey="v" stroke={CHART_COLORS.gold} strokeWidth={1.5} fill="url(#gasptp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Firewall Blocks — Facility Network Boundaries">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={series(96, 600, 200, 13)}>
                <CartesianGrid {...CHART_GRID_PROPS} />
                <XAxis dataKey="t" {...CHART_AXIS_PROPS} interval={11} />
                <YAxis {...CHART_AXIS_PROPS} width={40} />
                <Tooltip {...CHART_TOOLTIP_PROPS} />
                <Line type="monotone" dataKey="v" stroke={CHART_COLORS.warning} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="System Architecture Board" accent>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-[11px]">
          {[
            { l: "SCADA Historian A", s: "ONLINE", d: "PI Server · 99.98%" },
            { l: "SCADA Historian B (DR)", s: "ONLINE", d: "Replica · 142 ms lag" },
            { l: "OPC-UA Gateway", s: "ONLINE", d: `${commissioned}/${GAS_ASSETS.length} facilities connected` },
            { l: "AD Domain Controller", s: "ONLINE", d: "Kerberos · TLS 1.3" },
            { l: "Backup NAS", s: "SYNCING", d: "3.1 TB · nightly snap" },
            { l: "SIEM Splunk", s: "ONLINE", d: "340 events/s indexed" },
            { l: "Odorant Monitoring Bridge", s: "DEGRADED", d: "Retry queue: 2 samples" },
            { l: "GIS Tile Server", s: "ONLINE", d: "6 layers cached" },
            { l: "AI RAG Engine", s: "ONLINE", d: "7B · air-gapped" },
          ].map((c) => (
            <div key={c.l} className="panel p-3">
              <div className="text-[10.5px] font-medium">{c.l}</div>
              <div className={`text-[10px] mt-1 font-mono ${c.s === "ONLINE" ? "text-ok" : c.s === "DEGRADED" ? "text-warn" : "text-info"}`}>● {c.s}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{c.d}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
