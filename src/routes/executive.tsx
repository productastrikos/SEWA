import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/AppShell";
import { useApp } from "@/lib/app-context";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  ReferenceArea,
  Legend,
} from "recharts";
import { TrendingDown, DollarSign, Leaf, Zap } from "lucide-react";
import {
  CHART_COLORS,
  CHART_GRID_PROPS,
  CHART_AXIS_PROPS,
  CHART_TOOLTIP_PROPS,
  CHART_LEGEND_PROPS,
} from "@/lib/chart-theme";

export const Route = createFileRoute("/executive")({
  head: () => ({ meta: [{ title: "Executive Strategy & Energy Optimization · Project WAVE" }] }),
  component: ExecPage,
});

const HOURLY = Array.from({ length: 24 }, (_, h) => {
  const tariff =
    h >= 12 && h < 17 ? "peak" : (h >= 6 && h < 12) || (h >= 17 && h < 22) ? "mid" : "off";
  const rate = tariff === "peak" ? 0.42 : tariff === "mid" ? 0.28 : 0.15;
  const load =
    tariff === "peak"
      ? 62 + Math.random() * 8
      : tariff === "mid"
        ? 78 + Math.random() * 10
        : 92 + Math.random() * 6;
  return { hour: `${String(h).padStart(2, "0")}:00`, load: +load.toFixed(1), rate, tariff };
});

const SEC = Array.from({ length: 12 }, (_, i) => ({
  m: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
  sec: +(0.62 - i * 0.008 + (Math.random() - 0.5) * 0.02).toFixed(3),
  target: 0.55,
}));

function ExecPage() {
  const { t } = useApp();
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t("nav_exec")}
        subtitle="C-suite KPIs · Energy strategy · OPEX optimization"
        actions={
          <span className="text-[10px] px-2 py-1 rounded bg-accent/15 text-accent border border-accent/40 font-mono">
            FY 2026 · Q3
          </span>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="panel p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("energy")}
              </div>
              <div className="mt-1 text-2xl font-mono">
                0.548<span className="text-[11px] text-muted-foreground ms-1">kWh/m³</span>
              </div>
              <div className="text-[10.5px] text-ok mt-1">↓ 11.6% vs FY25 baseline</div>
            </div>
            <Zap className="w-5 h-5 text-accent" />
          </div>
        </div>
        <div className="panel p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Annual OPEX Savings
              </div>
              <div className="mt-1 text-2xl font-mono">
                AED 42.8<span className="text-[11px] text-muted-foreground ms-1">M</span>
              </div>
              <div className="text-[10.5px] text-ok mt-1">Peak-load shift + NRW</div>
            </div>
            <DollarSign className="w-5 h-5 text-accent" />
          </div>
        </div>
        <div className="panel p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                CO₂ Avoided
              </div>
              <div className="mt-1 text-2xl font-mono">
                18,420<span className="text-[11px] text-muted-foreground ms-1">tCO₂e/yr</span>
              </div>
              <div className="text-[10.5px] text-ok mt-1">Aligned to UAE Net-Zero 2050</div>
            </div>
            <Leaf className="w-5 h-5 text-accent" />
          </div>
        </div>
        <div className="panel p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Non-Revenue Water
              </div>
              <div className="mt-1 text-2xl font-mono">
                10.4<span className="text-[11px] text-muted-foreground ms-1">%</span>
              </div>
              <div className="text-[10.5px] text-ok mt-1">Best-in-class GCC region</div>
            </div>
            <TrendingDown className="w-5 h-5 text-accent" />
          </div>
        </div>
      </div>

      <Panel
        accent
        title={t("peakLoad") + " — 24-Hour Load Shifting Strategy"}
        right={
          <div className="flex gap-2 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-crit/60" />
              Peak tariff
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-warn/60" />
              Mid
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-ok/60" />
              Off-peak
            </span>
          </div>
        }
      >
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={HOURLY}>
              <CartesianGrid {...CHART_GRID_PROPS} />
              <XAxis dataKey="hour" {...CHART_AXIS_PROPS} interval={1} />
              <YAxis {...CHART_AXIS_PROPS} unit="%" width={40} />
              <Tooltip {...CHART_TOOLTIP_PROPS} />
              <Bar dataKey="load" radius={[3, 3, 0, 0]}>
                {HOURLY.map((h, i) => (
                  <Cell
                    key={i}
                    fill={
                      h.tariff === "peak"
                        ? CHART_COLORS.danger
                        : h.tariff === "mid"
                          ? CHART_COLORS.warning
                          : CHART_COLORS.success
                    }
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 text-[11px] text-muted-foreground">
          Pumping loads systematically shifted out of the{" "}
          <span className="text-crit">12:00–17:00 peak tariff window</span> into off-peak reservoir
          refill windows. Realized saving:{" "}
          <span className="text-ok font-medium">AED 3.6 M / month</span>.
        </div>
      </Panel>

      <Panel title="Specific Energy Consumption — 12-Month Trend vs Target">
        <div className="h-56">
          <ResponsiveContainer>
            <LineChart data={SEC}>
              <CartesianGrid {...CHART_GRID_PROPS} />
              <XAxis dataKey="m" {...CHART_AXIS_PROPS} />
              <YAxis {...CHART_AXIS_PROPS} unit=" kWh/m³" width={70} domain={[0.5, 0.7]} />
              <Tooltip {...CHART_TOOLTIP_PROPS} />
              <Legend {...CHART_LEGEND_PROPS} />
              <Line
                type="monotone"
                dataKey="sec"
                name="Actual SEC"
                stroke={CHART_COLORS.blue}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="FY26 target"
                stroke={CHART_COLORS.success}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
