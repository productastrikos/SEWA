import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/AppShell";
import { useApp } from "@/lib/app-context";
import { GAS_ASSETS, GAS_OPS_ADVICE, buildGasAdvisories, series, type Asset } from "@/lib/mock-data";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronRight, MapPin, ShieldCheck, X, Sparkles } from "@/lib/icons";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { CHART_COLORS, CHART_GRID_PROPS, CHART_AXIS_PROPS, CHART_TOOLTIP_PROPS } from "@/lib/chart-theme";
import { GisMapClient } from "@/GIS/GisMapClient";
import type { GisMapHandle } from "@/GIS/GisMap";

export const Route = createFileRoute("/gas/assets")({
  head: () => ({ meta: [{ title: "Gas Asset Matrix · Project WAVE" }] }),
  component: GasAssetsPage,
});

type DetailTab = "telemetry" | "health" | "gis" | "advice";

function GasAssetsPage() {
  const { t, lang, openAdvisoryPanel, setCurrentAdvisoryContext } = useApp();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("telemetry");
  const mapRef = useRef<GisMapHandle>(null);

  useEffect(() => {
    if (!selected) return;
    mapRef.current?.flyTo({ longitude: 55.4 + selected.x / 1800, latitude: 25.32 + selected.y / 2200, zoom: 12.4 });
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    setCurrentAdvisoryContext({
      assetId: selected.id,
      assetTag: selected.tag,
      sectorLabel: "Gas",
      items: buildGasAdvisories(selected),
    });
    return () => setCurrentAdvisoryContext(null);
  }, [selected, setCurrentAdvisoryContext]);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return GAS_ASSETS.filter(
      (a) => !ql || a.tag.toLowerCase().includes(ql) || a.name.toLowerCase().includes(ql) || a.location.toLowerCase().includes(ql),
    );
  }, [q]);

  const tabs: Array<{ key: DetailTab; label: string }> = [
    { key: "telemetry", label: "Live Telemetry" },
    { key: "health", label: "Asset Health" },
    { key: "gis", label: "GIS Topology" },
    { key: "advice", label: t("opsAdvice") },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      <PageHeader title={t("nav_gas_assets")} subtitle={`Industrial gas asset workspace · ${GAS_ASSETS.length} coded facilities · SCADA + GIS fused`} />

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
        <div className="text-[11px] font-mono text-muted-foreground">{filtered.length} / {GAS_ASSETS.length}</div>
      </div>

      <div className="flex-1 min-h-0">
        {!selected && (
        <Panel title="Master Asset Table" className="flex h-full min-h-0 flex-col">
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
                    className="cursor-pointer border-t border-border/60 transition hover:bg-primary/5"
                  >
                    <td className="px-4 py-2">
                      <div className="font-mono text-[11.5px] text-accent">{asset.tag}</div>
                      <div className="text-[10.5px] text-muted-foreground">{lang === "ar" ? asset.nameAr : asset.name}</div>
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">
                      {lang === "ar" ? asset.locationAr : asset.location}
                      <div className="text-[9.5px] text-muted-foreground/70">{asset.type}</div>
                    </td>
                    <td className="px-2 py-2">
                      {!asset.commissioned ? (
                        <span className="rounded bg-info/20 px-1.5 py-0.5 text-[10px] font-medium text-info">{t("commissioning").toUpperCase()}</span>
                      ) : (
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${asset.status === "crit" ? "bg-crit/20 text-crit" : asset.status === "warn" ? "bg-warn/20 text-warn" : "bg-ok/20 text-ok"}`}>
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
        )}

        {selected && (
        <Panel title={selected.tag} className="flex h-full min-h-0 flex-col">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">{selected.domain} · {selected.type}</div>
                  <div className="mt-1 text-[20px] font-semibold tracking-tight">{selected.tag}</div>
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
                  { label: t("outputFlowRate"), value: `${selected.flow.toLocaleString()} m³/hr`, tone: "text-accent" },
                  { label: t("deliveryPressure"), value: `${selected.pressure} bar`, tone: "text-ok" },
                  { label: t("link"), value: `${selected.link}%`, tone: selected.link > 90 ? "text-ok" : selected.link > 82 ? "text-warn" : "text-crit" },
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
                      <span>Delivery pressure · output flow rate · regulator state</span>
                      <span className="font-mono text-ok">STREAMING</span>
                    </div>
                    <div className="h-56">
                      <ResponsiveContainer>
                        <LineChart data={series(48, selected.pressure * 18, 8, selected.id.length)}>
                          <CartesianGrid {...CHART_GRID_PROPS} />
                          <XAxis dataKey="t" {...CHART_AXIS_PROPS} interval={7} />
                          <YAxis {...CHART_AXIS_PROPS} width={34} />
                          <Tooltip {...CHART_TOOLTIP_PROPS} />
                          <Line type="monotone" dataKey="v" stroke={CHART_COLORS.gold} strokeWidth={1.8} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Panel>
                  <Panel title="Live Variables" className="min-h-0">
                    <div className="space-y-3 text-[12px]">
                      {[
                        [t("outputFlowRate"), `${selected.flow.toLocaleString()} m³/hr`],
                        [t("deliveryPressure"), `${selected.pressure} bar`],
                        ["Regulator State", selected.passive ? "Telemetry only" : "Open / Auto"],
                        ["Odorant Injection", selected.commissioned ? "Nominal" : "N/A — commissioning"],
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

              {activeTab === "health" && (
                <Panel title="Predictive Diagnostics">
                  <div className="grid gap-3 lg:grid-cols-2">
                    {[
                      ["Regulator Wear Factor", "0.71", "Nominal"],
                      ["Vibration Profile", "Stable", "Within benchmark"],
                      ["Operating Hours", "9,204 h", "Service window due"],
                      ["Throughput Efficiency", "94%", "-1% vs commissioning"],
                    ].map(([label, value, note]) => (
                      <div key={label} className="rounded-xl border border-border/60 bg-surface-soft p-3">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{label}</div>
                        <div className="mt-1 text-[16px] font-semibold text-accent">{value}</div>
                        <div className="text-[11px] text-muted-foreground">{note}</div>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              {activeTab === "gis" && (
                <Panel title="Localized GIS Mini-Map & Topology">
                  <div className="mb-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Upstream trunk · regulator set · downstream limit</span>
                    <span className="font-semibold text-accent">Focused asset view</span>
                  </div>
                  <div className="h-[360px] overflow-hidden rounded-xl border border-border/70">
                    <GisMapClient ref={mapRef} mapVariant="network" focusCoordinates={[55.4 + selected.x / 1800, 25.32 + selected.y / 2200]} showRegionNav={false} showLegend={false} />
                  </div>
                </Panel>
              )}

              {activeTab === "advice" && (
                <Panel
                  title={t("opsAdvice")}
                  right={
                    <button
                      onClick={() =>
                        openAdvisoryPanel({
                          assetId: selected.id,
                          assetTag: selected.tag,
                          sectorLabel: "Gas",
                          items: buildGasAdvisories(selected),
                        })
                      }
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10.5px] font-semibold text-white"
                      style={{ background: "var(--ds-advisory)" }}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {t("openAdvisory")}
                    </button>
                  }
                >
                  <div className="rounded-xl border border-border/70 bg-surface-soft p-4 text-[12px] leading-6 text-muted-foreground">
                    <div className="mb-2 flex items-center gap-2 font-semibold text-accent">
                      <Sparkles className="h-4 w-4" />
                      Customized on-premises advisory · {selected.tag}
                    </div>
                    {GAS_OPS_ADVICE[selected.tag] ?? "No advisory data available for this facility."}
                  </div>
                </Panel>
              )}
        </Panel>
        )}
      </div>
    </div>
  );
}
