import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useApp } from "@/lib/app-context";
import { Zap } from "@/lib/icons";

export const Route = createFileRoute("/electric/")({
  head: () => ({ meta: [{ title: "Electrical Power Grid Sector · Project WAVE" }] }),
  component: ElectricComingSoonPage,
});

function ElectricComingSoonPage() {
  const { t } = useApp();
  return (
    <div className="p-6">
      <PageHeader title={t("nav_electric_hub")} subtitle="Top-Level Sector-Domain Architecture · Electrical Power Grid" />
      <div
        className="flex flex-col items-center justify-center text-center gap-4 rounded-2xl border p-16"
        style={{ borderColor: "var(--ds-border)", background: "var(--ds-panel)" }}
      >
        <div className="grid h-14 w-14 place-items-center rounded-full" style={{ background: "var(--ds-accent-bg)", color: "var(--ds-accent)" }}>
          <Zap className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold" style={{ color: "var(--ds-text)" }}>
          {t("electricComingSoonTitle")}
        </h2>
        <p className="max-w-lg text-sm leading-6" style={{ color: "var(--ds-text-faint)" }}>
          {t("electricComingSoonBody")}
        </p>
      </div>
    </div>
  );
}
