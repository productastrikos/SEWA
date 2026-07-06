import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/AppShell";
import { useApp } from "@/lib/app-context";
import { SCENARIOS, RISK_MATRIX } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";
import { Zap, Cloud, FlaskConical, Power, Play, Loader2 } from "lucide-react";
import { GisMapClient } from "@/GIS/GisMapClient";

export const Route = createFileRoute("/simulator")({
  head: () => ({ meta: [{ title: "Hydraulic Twin Simulator · Project WAVE" }] }),
  component: SimulatorPage,
});

const ICONS: Record<string, any> = { desal: Power, grid: Zap, flood: Cloud, contam: FlaskConical };

// Network trunk pipeline segments — the downstream branch recolors to red
// once the simulation collapses, giving a localized (not network-wide)
// head-loss pressure-drop signature radiating out from the isolated valve.
const PIPELINES = [
  { id: "trunk-main", d: "M10,50 L45,45 L70,55 L88,52", downstream: false },
  { id: "branch-south", d: "M45,45 L45,80", downstream: true },
];

function SimulatorPage() {
  const { t, lang } = useApp();
  const [running, setRunning] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const run = (scenarioId: string, label: string) => {
    setActive(scenarioId);
    setRunning(true);
    setCollapsed(false);
    toast.loading(`Running hydraulic solver: ${label}`, { id: "sim" });
    setTimeout(() => {
      setRunning(false);
      setCollapsed(true);
      toast.success(`Simulation complete — 5,842 nodes solved · 12 collapse zones`, { id: "sim" });
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t("nav_sim")}
        subtitle={"\u201CWhat-If\u201D crisis sandbox · Real-time EPANET-compatible solver"}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SCENARIOS.map((s) => {
          const Icon = ICONS[s.id];
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => run(s.id, s.label)}
              className={`panel p-4 text-start hover:border-primary/60 transition group ${isActive ? "panel-accent" : ""}`}
            >
              <Icon
                className={`w-5 h-5 mb-3 ${isActive ? "text-accent" : "text-muted-foreground group-hover:text-accent"}`}
              />
              <div className="text-[12.5px] font-medium">{lang === "ar" ? s.labelAr : s.label}</div>
              <div className="text-[10.5px] text-muted-foreground mt-1">Trigger scenario →</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-6">
        <Panel
          title="Digital Twin Network Map"
          accent
          right={
            <button
              onClick={() => run("valve", t("runSim"))}
              className="text-[10.5px] px-2.5 py-1 rounded bg-primary text-primary-foreground flex items-center gap-1.5"
            >
              <Play className="w-3 h-3" /> {t("runSim")}
            </button>
          }
        >
          <div className="relative h-[440px] overflow-hidden rounded border border-border/70 bg-surface-soft">
            <GisMapClient mapVariant="simulator" showRegionNav={false} showLegend={false} focusCoordinates={[55.392, 25.324]} />
            {running && (
              <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
                <div className="panel-accent flex items-center gap-3 px-6 py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-accent" />
                  <div>
                    <div className="text-[12px] font-medium">Solving hydraulic network…</div>
                    <div className="font-mono text-[10.5px] text-muted-foreground">5,842 nodes · 8,411 links · Δt=1s</div>
                  </div>
                </div>
              </div>
            )}
            <div className="absolute left-3 top-3 rounded border border-border/60 bg-panel/80 px-2 py-1 text-[10px] font-mono">
              {collapsed ? "Impact corridor detected · valve isolation active" : "Hydraulic twin aligned with the shared GIS topology"}
            </div>
          </div>
        </Panel>

        <Panel
          title={t("riskMatrix")}
          right={
            collapsed ? (
              <span className="text-[10px] text-crit alarm-pulse font-mono">● IMPACT DETECTED</span>
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono">STANDBY</span>
            )
          }
        >
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="text-start pb-2 font-medium">{t("facility")}</th>
                <th className="text-start pb-2 font-medium">{t("impact")}</th>
                <th className="text-end pb-2 font-medium">{t("eta")}</th>
              </tr>
            </thead>
            <tbody>
              {RISK_MATRIX.map((r, i) => (
                <tr key={i} className="border-t border-border/50 align-top">
                  <td className="py-2">
                    <div>{r.facility}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {r.type} · Pop: {r.pop.toLocaleString()}
                    </div>
                    {collapsed && (
                      <div className="text-[10px] text-accent mt-1 flex gap-1">
                        <span className="shrink-0">↳</span>
                        <span>{r.bypass}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        r.impact === "Critical"
                          ? "bg-crit/20 text-crit"
                          : r.impact === "High"
                            ? "bg-warn/20 text-warn"
                            : "bg-info/20 text-info"
                      }`}
                    >
                      {r.impact}
                    </span>
                  </td>
                  <td className="py-2 text-end font-mono text-[11px]">{collapsed ? r.eta : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {collapsed && (
            <div className="mt-4 p-3 rounded border border-crit/40 bg-crit/5 text-[11px]">
              <div className="font-medium text-crit mb-1">Recommended Mitigations</div>
              <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                <li>Cross-tie from BDAPS distribution pumping within 8 min</li>
                <li>Dispatch tanker fleet to Al Qasimi Hospital</li>
                <li>Initiate Emergency Communications Cell (Level 2)</li>
              </ul>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
