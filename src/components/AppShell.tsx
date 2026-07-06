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
} from "@/lib/icons";
import { useApp } from "@/lib/app-context";
import { useEffect, type ReactNode } from "react";

const NAV = [
  { to: "/", icon: LayoutGrid, key: "nav_hub" as const },
  { to: "/assets", icon: Boxes, key: "nav_assets" as const },
  { to: "/simulator", icon: Activity, key: "nav_sim" as const },
  { to: "/assistant", icon: MessageSquare, key: "nav_chat" as const },
  { to: "/governance", icon: ShieldCheck, key: "nav_gov" as const },
  { to: "/dma", icon: Gauge, key: "nav_dma" as const },
  { to: "/quality", icon: FlaskConical, key: "nav_quality" as const },
  { to: "/executive", icon: TrendingUp, key: "nav_exec" as const },
];

export function AppShell({ children }: { children: ReactNode }) {
  const {
    lang,
    setLang,
    theme,
    setTheme,
    isaMode,
    setIsaMode,
    authUser,
    logout,
    hasAccess,
    t,
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

  const blocked = authUser && !hasAccess(pathname);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--ds-bg)", color: "var(--ds-text)" }}
    >
      <header
        className="h-[74px] shrink-0 flex items-center px-6 gap-4"
        style={{ background: "var(--ds-panel)", borderBottom: "1px solid var(--ds-border)" }}
      >
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

        <div className="hidden md:flex items-center gap-2 ms-6 text-[11px]" style={{ color: "var(--ds-text-faint)" }}>
          <span className="h-1.5 w-1.5 rounded-full pulse-glow" style={{ background: "var(--ds-success)" }} />
          <span>SCADA link · Primary DR · UTC+04</span>
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

        <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white" style={{ background: "var(--ds-advisory)" }}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>Advisory</span>
        </button>

        <div className="flex items-center gap-3 rounded-lg border px-3 py-2" style={{ borderColor: "var(--ds-border-soft)", background: "var(--ds-surface-soft)" }}>
          <div className="grid h-8 w-8 place-items-center rounded-full" style={{ background: "var(--ds-surface-raised)", color: "var(--ds-text-muted)" }}>
            <User className="w-4 h-4" />
          </div>
          <div className="leading-tight text-[11px] hidden lg:block">
            <div className="font-semibold" style={{ color: "var(--ds-text)" }}>
              {authUser.displayName}
            </div>
            <div style={{ color: "var(--ds-text-faint)" }}>
              {authUser.roleLabel} · {authUser.clearance}
            </div>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold"
          style={{ background: "var(--ds-surface-soft)", color: "var(--ds-text-muted)" }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t("logout")}</span>
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-[244px] shrink-0 flex flex-col" style={{ background: "var(--ds-panel)", borderInlineEnd: "1px solid var(--ds-border)" }}>
          <div className="px-4 pt-5 pb-2">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--ds-text-faint)" }}>
              Workspaces
            </div>
          </div>

          <nav className="flex-1 px-2 pb-2 space-y-0.5 overflow-y-auto">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
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
