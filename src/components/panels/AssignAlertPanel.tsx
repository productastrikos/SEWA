import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import { SlidePanel } from "./SlidePanel";
import { RtlText } from "./RtlText";

const FIELD_CREWS = ["Field Crew 1", "Field Crew 2", "Field Crew 3", "Instrumentation Team", "SCADA Ops Desk"];
const PRIORITY_LEVELS = ["P1 · Critical", "P2 · High", "P3 · Medium", "P4 · Low"];

function defaultPriority(severity: 1 | 2 | 3) {
  return PRIORITY_LEVELS[severity - 1] ?? PRIORITY_LEVELS[2];
}

export function AssignAlertPanel() {
  const { lang, t, alertPanel, closeAlertPanel } = useApp();
  const [crew, setCrew] = useState(FIELD_CREWS[1]);
  const [priority, setPriority] = useState(PRIORITY_LEVELS[1]);
  const [sop, setSop] = useState<string>("");

  useEffect(() => {
    if (!alertPanel) return;
    setCrew(FIELD_CREWS[1]);
    setPriority(defaultPriority(alertPanel.alarm.severity));
    setSop(alertPanel.sopOptions[0] ?? "");
  }, [alertPanel]);

  const dispatch = () => {
    if (!alertPanel) return;
    const wo = `WO-${Math.floor(400000 + Math.random() * 90000)}`;
    toast.success(`${t("dispatchToast")} — ${wo} · ${alertPanel.alarm.asset} → ${crew}`);
    closeAlertPanel();
  };

  const alarm = alertPanel?.alarm;
  const quality = alarm?.ack ? t("qualityGood") : t("qualityUncertain");

  return (
    <SlidePanel open={!!alertPanel} onClose={closeAlertPanel} title={<RtlText>{t("assignAlertTitle")}</RtlText>} width={420}>
      {alarm && alertPanel && (
        <div className="p-4 space-y-4">
          <div
            className="rounded-lg border p-3 space-y-2"
            style={{ borderColor: "var(--ds-danger-border)", background: "var(--ds-danger-bg)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("alarmTag")}</span>
              <span className="font-mono text-[12px] font-semibold text-crit">{alarm.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("timestampLabel")}</span>
              <span className="font-mono text-[12px]">{alarm.ts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("qualityState")}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                style={{
                  background: alarm.ack ? "var(--ds-success-bg)" : "var(--ds-warning-bg)",
                  color: alarm.ack ? "var(--ds-success)" : "var(--ds-warning)",
                }}
              >
                {quality}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("assetIdLabel")}</span>
              <span className="font-mono text-[12px] text-accent">{alarm.asset}</span>
            </div>
            <RtlText as="div" className="text-[11.5px] leading-6 text-muted-foreground pt-1">
              {lang === "ar" ? alarm.descriptionAr : alarm.description}
            </RtlText>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{t("fieldCrew")}</div>
            <select
              value={crew}
              onChange={(e) => setCrew(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-[12px]"
              style={{ borderColor: "var(--ds-border-soft)", background: "var(--ds-surface-soft)" }}
            >
              {FIELD_CREWS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{t("priorityLevel")}</div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-[12px]"
              style={{ borderColor: "var(--ds-border-soft)", background: "var(--ds-surface-soft)" }}
            >
              {PRIORITY_LEVELS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{t("sopChecklist")}</div>
            <select
              value={sop}
              onChange={(e) => setSop(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-[12px]"
              style={{ borderColor: "var(--ds-border-soft)", background: "var(--ds-surface-soft)" }}
            >
              {alertPanel.sopOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={dispatch}
            className="w-full rounded-md py-2.5 text-[12px] font-mono font-semibold text-white"
            style={{ background: "var(--ds-danger)" }}
          >
            {t("dispatchWorkOrder")}
          </button>
        </div>
      )}
    </SlidePanel>
  );
}
