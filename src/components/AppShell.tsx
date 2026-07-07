import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Boxes,
  FlaskConical,
  Gauge,
  LayoutGrid,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Waves,
  Globe,
  User,
  Sparkles,
  ScanEye,
  LogOut,
  Lock,
  Flame,
  Zap as GridIcon,
} from "@/lib/icons";
import { useApp, SECTOR_HOME, type Sector, type RoutePath } from "@/lib/app-context";
import { useEffect, useMemo, type ComponentType, type ReactNode } from "react";
import { AdvisoryPanel } from "@/components/panels/AdvisoryPanel";
import { AssignAlertPanel } from "@/components/panels/AssignAlertPanel";
import {
  buildWaterSectorAdvisories,
  buildGasSectorAdvisories,
  buildElectricSectorAdvisories,
} from "@/lib/mock-data";

type NavItem = {
  to: RoutePath;
  icon: ComponentType<{ className?: string }>;
  key: Parameters<ReturnType<typeof useApp>["t"]>[0];
  exact?: boolean;
};

const NAV_WATER: NavItem[] = [
  { to: "/", icon: LayoutGrid, key: "nav_hub", exact: true },
  { to: "/assets", icon: Boxes, key: "nav_assets" },
  { to: "/simulator", icon: Activity, key: "nav_sim" },
  { to: "/assistant", icon: MessageSquare, key: "nav_chat" },
  { to: "/governance", icon: ShieldCheck, key: "nav_gov" },
  { to: "/dma", icon: Gauge, key: "nav_dma" },
  { to: "/quality", icon: FlaskConical, key: "nav_quality" },
  { to: "/executive", icon: TrendingUp, key: "nav_exec" },
];

const NAV_GAS: NavItem[] = [
  { to: "/gas", icon: LayoutGrid, key: "nav_gas_hub", exact: true },
  { to: "/gas/assets", icon: Boxes, key: "nav_gas_assets" },
  { to: "/gas/simulator", icon: Activity, key: "nav_gas_sim" },
  { to: "/gas/assistant", icon: MessageSquare, key: "nav_gas_chat" },
  { to: "/gas/governance", icon: ShieldCheck, key: "nav_gas_gov" },
  { to: "/gas/dma", icon: Gauge, key: "nav_gas_dma" },
  { to: "/gas/quality", icon: FlaskConical, key: "nav_gas_quality" },
];

const NAV_ELECTRIC: NavItem[] = [
  { to: "/electric", icon: GridIcon, key: "nav_electric_hub", exact: true },
];

const NAV_BY_SECTOR: Record<Sector, NavItem[]> = {
  water: NAV_WATER,
  gas: NAV_GAS,
  electric: NAV_ELECTRIC,
};

const SECTORS: Array<{ id: Sector; icon: ComponentType<{ className?: string }>; key: Parameters<ReturnType<typeof useApp>["t"]>[0] }> = [
  { id: "water", icon: Waves, key: "sector_water" },
  { id: "gas", icon: Flame, key: "sector_gas" },
  { id: "electric", icon: GridIcon, key: "sector_electric" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const {
    lang,
    setLang,
    theme,
    setTheme,
    sector,
    setSector,
    isaMode,
    setIsaMode,
    authUser,
    logout,
    hasAccess,
    t,
    currentAdvisoryContext,
    openAdvisoryPanel,
  } = useApp();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!authUser) return;
    if (!hasAccess(pathname)) {
      const fallback = authUser.routes[0];
      if (fallback && fallback !== pathname) {
        void router.navigate({ to: fallback });
      }
    }
  }, [authUser, hasAccess, pathname, router]);

  // Keep sector state (sidebar + theme accent) in sync with the URL —
  // handles deep links, browser back/forward, and reloads, not just clicks
  // on the sector switcher.
  useEffect(() => {
    const inferred: Sector = pathname.startsWith("/gas")
      ? "gas"
      : pathname.startsWith("/electric")
        ? "electric"
        : "water";
    if (inferred !== sector) setSector(inferred);
  }, [pathname, sector, setSector]);

  // Sector-wide AI advisory — always available as a fallback so the header
  // AI Advisory button works on every page, not just Asset Detail views.
  // A more specific per-asset advisory (set by the Asset Detail pages)
  // takes priority whenever one is active.
  const sectorAdvisory = useMemo(() => {
    const sectorLabel = sector === "gas" ? "Gas" : sector === "electric" ? "Electric" : "Water";
    const items =
      sector === "gas"
        ? buildGasSectorAdvisories()
        : sector === "electric"
          ? buildElectricSectorAdvisories()
          : buildWaterSectorAdvisories();
    return { assetId: "ALL", assetTag: `${sectorLabel} Network`, sectorLabel, items };
  }, [sector]);

  if (!authUser) return null;

  const blocked = !hasAccess(pathname);
  const nav = NAV_BY_SECTOR[sector];

  const selectSector = (next: Sector) => {
    if (next === sector) return;
    setSector(next);
    void router.navigate({ to: SECTOR_HOME[next] });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--ds-bg)", color: "var(--ds-text)" }}
    >
      <header
        className="shrink-0 flex flex-col gap-3 px-6 py-3"
        style={{ background: "var(--ds-panel)", borderBottom: "1px solid var(--ds-border)" }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: "var(--ds-surface-raised)", color: "var(--ds-text)" }}>
              <Waves className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-[13px] font-semibold tracking-tight">Project WAVE</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.16em]" style={{ color: "var(--ds-text-faint)" }}>
                SEWA Operations Console
              </div>
            </div>
          </div>

          {/* Top-Level Sector-Domain Switcher — Water / Gas / Electricity */}
          <div className="flex items-center gap-1 p-1 ms-2" style={{ background: "var(--ds-surface-soft)", borderRadius: 10, boxShadow: "var(--ds-shadow-xs)" }}>
            {SECTORS.map((s) => {
              const Icon = s.icon;
              const active = sector === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => selectSector(s.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.03em] transition"
                  style={{
                    borderRadius: 7,
                    background: active ? "var(--ds-accent-bg)" : "transparent",
                    color: active ? "var(--ds-accent)" : "var(--ds-text-faint)",
                    border: `1px solid ${active ? "var(--ds-accent-border)" : "transparent"}`,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">{t(s.key)}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1" />

          <div className="flex items-center p-0.5" style={{ background: "var(--ds-surface-soft)", borderRadius: 8, boxShadow: "var(--ds-shadow-xs)" }}>
            {(["dark", "light"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setTheme(m)}
                className="px-3 py-1 text-[10.5px] font-semibold transition"
                style={{
                  borderRadius: 6,
                  letterSpacing: "0.02em",
                  background: theme === m ? "var(--ds-surface-raised)" : "transparent",
                  color: theme === m ? "var(--ds-text)" : "var(--ds-text-faint)",
                }}
              >
                {m === "dark" ? "Dark" : "Light"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsaMode(!isaMode)}
            title={t("isaHint")}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10.5px] font-semibold transition"
            style={{
              background: isaMode ? "var(--ds-warning-bg)" : "var(--ds-surface-soft)",
              color: isaMode ? "var(--ds-warning)" : "var(--ds-text-muted)",
              border: `1px solid ${isaMode ? "var(--ds-warning-border)" : "transparent"}`,
            }}
          >
            <ScanEye className="w-3.5 h-3.5" />
            <span>{t("isaLabel")}</span>
          </button>

          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-medium transition"
            style={{ background: "var(--ds-surface-soft)", color: "var(--ds-text-muted)" }}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === "en" ? "EN" : "ع"}</span>
          </button>

          <button
            onClick={() => openAdvisoryPanel(currentAdvisoryContext ?? sectorAdvisory)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white transition"
            style={{ background: "var(--ds-advisory)" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("openAdvisory")}</span>
          </button>

          <button
            onClick={() => logout()}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold"
            style={{ background: "var(--ds-surface-soft)", color: "var(--ds-text-muted)" }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t("logout")}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-[11px]" style={{ color: "var(--ds-text-faint)" }}>
            <span className="h-1.5 w-1.5 rounded-full pulse-glow" style={{ background: "var(--ds-success)" }} />
            <span>SCADA link · Primary DR · UTC+04</span>
          </div>
          <div className="flex-1" />
          {/* Retained active user role identity banner chip */}
          <div className="flex items-center gap-3 rounded-lg border px-3 py-1.5" style={{ borderColor: "var(--ds-border-soft)", background: "var(--ds-surface-soft)" }}>
            <div className="grid h-6 w-6 place-items-center rounded-full" style={{ background: "var(--ds-surface-raised)", color: "var(--ds-text-muted)" }}>
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px]" style={{ color: "var(--ds-text-muted)" }}>
              <span className="font-semibold" style={{ color: "var(--ds-text)" }}>
                {t("loggedUserLabel")}: {authUser.displayName}
              </span>
              <span> | {t("role")}: {authUser.roleTitle}</span>
              <span> | {t("clearance")}: {authUser.clearance}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-[244px] shrink-0 flex flex-col" style={{ background: "var(--ds-panel)", borderInlineEnd: "1px solid var(--ds-border)" }}>
          <div className="px-4 pt-5 pb-2">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--ds-text-faint)" }}>
              Workspaces
            </div>
          </div>

          <nav className="flex-1 px-2 pb-2 space-y-0.5 overflow-y-auto">
            {nav.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const allowed = hasAccess(item.to);
              if (!allowed) return null;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] transition"
                  style={{
                    fontWeight: active ? 600 : 500,
                    background: active ? "var(--ds-accent-bg)" : "transparent",
                    color: active ? "var(--ds-accent)" : "var(--ds-text-muted)",
                    border: `1px solid ${active ? "var(--ds-accent-border)" : "transparent"}`,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 truncate">{t(item.key)}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mx-3 mb-3 rounded-xl border p-3" style={{ background: "var(--ds-surface-soft)", borderColor: "var(--ds-border-soft)" }}>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.06em]" style={{ color: "var(--ds-text-faint)" }}>
              Clearance context
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <span style={{ color: "var(--ds-text-faint)" }}>Scope</span>
                <span className="text-right font-medium" style={{ color: "var(--ds-text)" }}>{authUser.shortTitle}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span style={{ color: "var(--ds-text-faint)" }}>Pages</span>
                <span className="text-right font-medium" style={{ color: "var(--ds-text)" }}>{authUser.routes.length} active</span>
              </div>
              <div className="mt-2 rounded-lg border px-2 py-2 text-[10.5px] leading-5" style={{ borderColor: "var(--ds-border-soft)", color: "var(--ds-text-faint)" }}>
                {authUser.scope}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-auto">
          {blocked ? (
            <div className="flex h-full items-center justify-center p-6">
              <div className="max-w-md rounded-2xl border p-6 text-center" style={{ borderColor: "var(--ds-border)", background: "var(--ds-panel)" }}>
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full" style={{ background: "var(--ds-danger-bg)", color: "var(--ds-danger)" }}>
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold">{t("accessDenied")}</h2>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--ds-text-faint)" }}>
                  {t("accessBlocked")}
                </p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      <AdvisoryPanel />
      <AssignAlertPanel />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-6 gap-4">
      <div>
        <h1 className="text-[20px] font-bold" style={{ color: "var(--ds-text)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[12px]" style={{ color: "var(--ds-text-faint)", lineHeight: 1.4 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions}
    </div>
  );
}

export function Panel({
  title,
  right,
  children,
  className = "",
}: {
  title?: string;
  accent?: boolean;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={className}
      style={{
        background: "var(--ds-panel)",
        border: "1px solid var(--ds-panel-border)",
        borderRadius: 12,
      }}
    >
      {title && (
        <header className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--ds-border-soft)" }}>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--ds-text-muted)" }}>
            {title}
          </h3>
          {right}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
