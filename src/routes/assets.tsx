import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/AppShell";
import { useApp } from "@/lib/app-context";
import { ASSETS, ASSET_CATEGORIES, series, type Asset } from "@/lib/mock-data";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ChevronRight,
  MapPin,
  Wrench,
  Sparkles,
  X,
  Activity,
  ShieldCheck,
  TrendingUp,
  Database,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  CHART_COLORS,
  CHART_GRID_PROPS,
  CHART_AXIS_PROPS,
  CHART_TOOLTIP_PROPS,
} from "@/lib/chart-theme";
import { GisMapClient } from "@/GIS/GisMapClient";
import type { GisMapHandle } from "@/GIS/GisMap";
import { toast } from "sonner";

export const Route = createFileRoute("/assets")({
  head: () => ({ meta: [{ title: "Asset Diagnostic Matrix · Project WAVE" }] }),
  component: AssetsPage,
});

type DetailTab = "telemetry" | "health" | "sap" | "gis" | "sop";

function AssetsPage() {
  const { t, lang } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [selected, setSelected] = useState<Asset | null>(ASSETS[1]);
  const [activeTab, setActiveTab] = useState<DetailTab>("telemetry");
  const mapRef = useRef<GisMapHandle>(null);

  useEffect(() => {
    if (!selected) return;
    mapRef.current?.flyTo({
      longitude: 55.4 + selected.x / 1800,
      latitude: 25.32 + selected.y / 2200,
      zoom: 12.4,
    });
  }, [selected]);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return ASSETS.filter(
      (a) =>
        (cat === "all" || a.type === cat) &&
        (!ql ||
          a.tag.toLowerCase().includes(ql) ||
          a.name.toLowerCase().includes(ql) ||
          a.location.toLowerCase().includes(ql)),
    );
  }, [q, cat]);

  const tabs: Array<{ key: DetailTab; label: string }> = [
    { key: "telemetry", label: "Live Telemetry" },
    { key: "health", label: "Asset Health" },
    { key: "sap", label: "SAP EAM" },
    { key: "gis", label: "GIS Topology" },
    { key: "sop", label: "Ops Assistant" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      <PageHeader
        title={t("nav_assets")}
        subtitle={`Industrial multi-tab asset workspace · ${ASSETS.length} assets · SAP + SCADA + GIS fused`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute start-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={t("search")}
            className="w-full rounded-md border border-border bg-panel px-9 py-2 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <select
          value={cat}
          onChange={(event) => setCat(event.target.value)}
          className="rounded-md border border-border bg-panel px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label={t("categoryFilter")}
        >
          {ASSET_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {lang === "ar" ? c.labelAr : c.label}
            </option>
          ))}
        </select>
        <div className="text-[11px] font-mono text-muted-foreground">
          {filtered.length} / {ASSETS.length}
        </div>
      </div>

      <div className="grid flex-1 min-h-0 gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
        <Panel title="Master Asset Entry" className="flex min-h-0 flex-col">
          <div className="-mx-4 -mb-4 overflow-auto">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-panel">
                <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2 text-start font-medium">{t("asset")}</th>
                  <th className="px-2 py-2 text-start font-medium">{t("location")}</th>
                  <th className="px-2 py-2 text-start font-medium">{t("status")}</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => setSelected(asset)}
                    className={`cursor-pointer border-t border-border/60 transition hover:bg-primary/5 ${selected?.id === asset.id ? "bg-primary/10" : ""}`}
                  >
                    <td className="px-4 py-2">
                      <div className="font-mono text-[11.5px] text-accent">{asset.tag}</div>
                      <div className="text-[10.5px] text-muted-foreground">
                        {lang === "ar" ? asset.nameAr : asset.name}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">
                      {lang === "ar" ? asset.locationAr : asset.location}
                      <div className="text-[9.5px] text-muted-foreground/70">
                        {asset.type}
                        {asset.passive ? ` · ${t("passiveNode")}` : ""}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      {!asset.commissioned ? (
                        <span className="rounded bg-info/20 px-1.5 py-0.5 text-[10px] font-medium text-info">
                          {t("commissioning").toUpperCase()}
                        </span>
                      ) : (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${asset.status === "crit" ? "bg-crit/20 text-crit" : asset.status === "warn" ? "bg-warn/20 text-warn" : "bg-ok/20 text-ok"}`}
                        >
                          {asset.status.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-end">
                      <button className="inline-flex items-center gap-1 text-[10.5px] text-accent hover:underline">
                        {t("viewDetails")} <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title={selected ? selected.tag : "Asset Drill-Down"} className="flex min-h-0 flex-col">
          {!selected ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border/70 p-8 text-center text-[12px] text-muted-foreground">
              Select an asset from the registry to open the dedicated control-room detail workspace.
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    {selected.domain} · {selected.type}
                  </div>
                  <div className="mt-1 text-[20px] font-semibold tracking-tight">{selected.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2 py-0.5">
                      <MapPin className="h-3 w-3" /> {selected.location}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2 py-0.5">
                      <ShieldCheck className="h-3 w-3" /> {selected.edgeDevice}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-lg border border-border/60 p-2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 grid gap-3 md:grid-cols-3">
                {[
                  { label: "Live Pressure", value: `${selected.pressure} bar`, tone: "text-ok" },
                  { label: "Flow", value: `${selected.flow.toLocaleString()} m³/hr`, tone: "text-accent" },
                  { label: "Link Quality", value: `${selected.link}%`, tone: selected.link > 90 ? "text-ok" : selected.link > 82 ? "text-warn" : "text-crit" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-border/70 bg-surface-soft p-3">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{item.label}</div>
                    <div className={`mt-1 text-[16px] font-semibold ${item.tone}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${activeTab === tab.key ? "text-white" : "text-muted-foreground"}`}
                    style={{ background: activeTab === tab.key ? "var(--ds-accent)" : "var(--ds-surface-soft)" }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "telemetry" && (
                <div className="space-y-4">
                  <Panel title="2s SCADA Loop" className="min-h-0">
                    <div className="mb-3 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Outlet gradient · motor draw · valve state</span>
                      <span className="font-mono text-ok">STREAMING</span>
                    </div>
                    <div className="h-56">
                      <ResponsiveContainer>
                        <LineChart data={series(48, selected.pressure * 18, 8, selected.id.length)}>
                          <CartesianGrid {...CHART_GRID_PROPS} />
                          <XAxis dataKey="t" {...CHART_AXIS_PROPS} interval={7} />
                          <YAxis {...CHART_AXIS_PROPS} width={34} />
                          <Tooltip {...CHART_TOOLTIP_PROPS} />
                          <Line type="monotone" dataKey="v" stroke={CHART_COLORS.blue} strokeWidth={1.8} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Panel>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Panel title="Live Variables" className="min-h-0">
                      <div className="space-y-3 text-[12px]">
                        {[
                          ["Flow", `${selected.flow.toLocaleString()} m³/hr`],
                          ["Outlet Gradient", `${selected.pressure * 1.6} kPa/m`],
                          ["Motor Amp Draw", `${Math.round(selected.pressure * 14)} A`],
                          ["Valve State", selected.passive ? "Telemetry only" : "Open / Auto"],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-semibold">{value}</span>
                          </div>
                        ))}
                      </div>
                    </Panel>
                    <Panel title="Anomaly Watch" className="min-h-0">
                      <div className="space-y-2 text-[12px]">
                        {[
                          { label: "Bearing vibration drift", value: "+0.8 mm/s", tone: "text-warn" },
                          { label: "Seal temperature", value: "72°C", tone: "text-accent" },
                          { label: "Sensor drift warning", value: "RECALIBRATE", tone: "text-crit" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className={`font-semibold ${item.tone}`}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </div>
                </div>
              )}

              {activeTab === "health" && (
                <div className="space-y-4">
                  <Panel title="Predictive Diagnostics">
                    <div className="grid gap-3 lg:grid-cols-2">
                      {[
                        ["Wear Factor", "0.82", "High confidence"],
                        ["Vibration Profile", "Stable", "Within benchmark"],
                        ["Operating Hours", "12,418 h", "Service window due"],
                        ["Pump Efficiency", "87%", "-3% vs factory"],
                      ].map(([label, value, note]) => (
                        <div key={label} className="rounded-xl border border-border/60 bg-surface-soft p-3">
                          <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{label}</div>
                          <div className="mt-1 text-[16px] font-semibold text-accent">{value}</div>
                          <div className="text-[11px] text-muted-foreground">{note}</div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                  <Panel title="Reliability Timeline">
                    <div className="flex flex-col gap-2 text-[12px]">
                      {[
                        { label: "Last PM completed", value: "2026-06-18" },
                        { label: "Next planned service", value: "2026-08-07" },
                        { label: "Critical drift warning", value: "3 sensor channels" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
              )}

              {activeTab === "sap" && (
                <div className="space-y-4">
                  <Panel title="SAP Enterprise Lifecycle Management">
                    <div className="space-y-2 text-[12px]">
                      {[
                        { id: "WO-4482192", state: "SCHED", detail: "Preventive service window — vibration check" },
                        { id: "WO-4481983", state: "OPEN", detail: "Bearing replacement pending approval" },
                        { id: "WO-4479224", state: "DONE", detail: "Motor seal inspection completed" },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                          <div>
                            <div className="font-semibold text-accent">{item.id}</div>
                            <div className="text-[11px] text-muted-foreground">{item.detail}</div>
                          </div>
                          <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${item.state === "OPEN" ? "bg-warn/20 text-warn" : item.state === "DONE" ? "bg-ok/20 text-ok" : "bg-info/20 text-info"}`}>{item.state}</span>
                        </div>
                      ))}
                    </div>
                  </Panel>
                  <Panel title="Safety & Documentation">
                    <div className="space-y-2 text-[12px]">
                      {[
                        ["Permit token", "PT-2248"],
                        ["Technical datasheet", "PMP-HMDPS-02 Rev 4"],
                        ["Maintenance guide", "Digital SOP 3.2 / pump alignment"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
              )}

              {activeTab === "gis" && (
                <Panel title="Localized GIS Mini-Map & Topology">
                  <div className="mb-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Upstream manifold · isolation node · downstream limit</span>
                    <span className="font-semibold text-accent">Focused asset view</span>
                  </div>
                  <div className="h-[360px] overflow-hidden rounded-xl border border-border/70">
                    <GisMapClient
                      ref={mapRef}
                      mapVariant="network"
                      focusCoordinates={[55.4 + selected.x / 1800, 25.32 + selected.y / 2200]}
                      showRegionNav={false}
                      showLegend={false}
                    />
                  </div>
                </Panel>
              )}

              {activeTab === "sop" && (
                <div className="space-y-4">
                  <Panel title="Operations Assistant & SOPs">
                    <div className="rounded-xl border border-border/70 bg-surface-soft p-4 text-[12px] leading-6 text-muted-foreground">
                      <div className="mb-2 flex items-center gap-2 font-semibold text-accent">
                        <Sparkles className="h-4 w-4" />
                        Context-aware advisory
                      </div>
                      Current telemetry indicates a mild vibration drift on {selected.tag}. Follow the digital SOP checklist: verify seal temperature, confirm valve state, and stage a balanced maintenance request if the trend persists for 24 hours.
                    </div>
                  </Panel>
                  <Panel title="Dispatch to SAP Integration Suite">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-surface-soft p-4">
                      <div>
                        <div className="text-[12px] font-semibold">Draft maintenance log ready</div>
                        <div className="text-[11px] text-muted-foreground">Securely transmit the current asset context to SAP EAM.</div>
                      </div>
                      <button
                        onClick={() => toast.success(`SAP draft sent for ${selected.tag}`)}
                        className="rounded-lg bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground"
                      >
                        Dispatch draft log
                      </button>
                    </div>
                  </Panel>
                </div>
              )}
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
