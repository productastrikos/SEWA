import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp, type AdvisoryItem } from "@/lib/app-context";
import { SlidePanel } from "./SlidePanel";
import { RtlText } from "./RtlText";
import { ChevronLeft, Sparkles, Check, Lock, User } from "@/lib/icons";

const FIELD_OPERATORS = ["Field Crew 1", "Field Crew 2", "Field Crew 3", "Instrumentation Team"];

function severityLabel(s: AdvisoryItem["severity"]) {
  return s === "danger" ? "CRITICAL" : s === "warning" ? "WARNING" : "INFO";
}

export function AdvisoryPanel() {
  const { lang, t, advisoryPanel, closeAdvisoryPanel } = useApp();
  const [selectedItem, setSelectedItem] = useState<AdvisoryItem | null>(null);
  const [operator, setOperator] = useState("");

  // Reset to the list view whenever a new advisory context is opened.
  useEffect(() => {
    setSelectedItem(null);
    setOperator("");
  }, [advisoryPanel]);

  const open = !!advisoryPanel;

  const dispatch = () => {
    if (!selectedItem || !advisoryPanel || !operator) return;
    toast.success(`${t("dispatchToast")} — ${advisoryPanel.assetTag} → ${operator}`);
    setSelectedItem(null);
    setOperator("");
  };

  const acknowledge = () => toast.success(t("adviceAcknowledgedToast"));
  const lockProfile = () => toast.info(t("profileLockedToast"));

  return (
    <SlidePanel
      open={open}
      onClose={closeAdvisoryPanel}
      title={
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--ds-text-faint)" }}>
            {t("detailViewLabel")}
          </div>
          <div className="mt-1 text-[17px] font-bold leading-tight" style={{ color: "var(--ds-text)" }}>
            {t("advisoryPanelTitle")}
          </div>
          <div className="text-[11.5px]" style={{ color: "var(--ds-text-faint)" }}>
            {t("predictiveInsights")}
          </div>
        </div>
      }
      width={430}
    >
      {advisoryPanel && !selectedItem && (
        <div className="p-3 space-y-2.5">
          {advisoryPanel.items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="w-full text-left rounded-2xl p-4 transition hover:brightness-110"
              style={{ background: "var(--ds-advisory)" }}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.8)" }}>
                <Sparkles className="w-3 h-3" />
                {severityLabel(item.severity)} · {lang === "ar" ? item.categoryAr : item.category}
              </div>
              <RtlText as="div" className="mt-1.5 text-[13.5px] font-bold text-white leading-snug">
                {lang === "ar" ? item.titleAr : item.title}
              </RtlText>
              <RtlText
                as="div"
                className="mt-1.5 text-[10.5px] font-mono leading-relaxed"
              >
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{lang === "ar" ? item.diagnosticAr : item.diagnostic}</span>
              </RtlText>
            </button>
          ))}
        </div>
      )}

      {advisoryPanel && selectedItem && (
        <div className="p-3 space-y-4">
          <button
            onClick={() => setSelectedItem(null)}
            className="flex items-center gap-1 text-[12px] font-semibold"
            style={{ color: "var(--ds-advisory)" }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {t("backToAllAdvisories")}
          </button>

          <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--ds-advisory)" }}>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.8)" }}>
              <Sparkles className="w-3 h-3" />
              {severityLabel(selectedItem.severity)} · {lang === "ar" ? selectedItem.categoryAr : selectedItem.category}
            </div>
            <RtlText as="div" className="text-[15px] font-bold text-white leading-snug">
              {lang === "ar" ? selectedItem.titleAr : selectedItem.title}
            </RtlText>
            <RtlText as="p" className="text-[12px] leading-relaxed">
              <span style={{ color: "rgba(255,255,255,0.9)" }}>{lang === "ar" ? selectedItem.summaryAr : selectedItem.summary}</span>
            </RtlText>
            <div className="rounded-lg p-2.5" style={{ background: "rgba(0,0,0,0.18)" }}>
              <div className="text-[9.5px] font-bold uppercase tracking-wide mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                {t("signalMetric")}
              </div>
              <RtlText as="div" className="text-[11px] font-mono leading-relaxed">
                <span style={{ color: "rgba(255,255,255,0.9)" }}>{lang === "ar" ? selectedItem.diagnosticAr : selectedItem.diagnostic}</span>
              </RtlText>
            </div>
          </div>

          <div className="rounded-2xl p-4 space-y-2" style={{ background: "var(--ds-surface-soft)", border: "1px solid var(--ds-border-soft)" }}>
            <div className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: "var(--ds-text-faint)" }}>
              {t("recommendedAction")}
            </div>
            <RtlText as="p" className="text-[12px] leading-relaxed">
              <span style={{ color: "var(--ds-text-muted)" }}>{lang === "ar" ? selectedItem.historyAr : selectedItem.history}</span>
            </RtlText>
            <div className="text-[10px] font-mono" style={{ color: "var(--ds-text-faint)" }}>
              {t("refLabel")}: {selectedItem.id} / {advisoryPanel.assetTag} / {selectedItem.coordinate}
            </div>
          </div>

          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--ds-text-faint)" }}>
              {t("assignToFieldOperator")}
            </div>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-[12px]"
              style={{
                borderColor: "var(--ds-border-soft)",
                background: "var(--ds-surface-soft)",
                color: operator ? "var(--ds-text)" : "var(--ds-text-faint)",
              }}
            >
              <option value="">{t("selectRegisteredUser")}</option>
              {FIELD_OPERATORS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={dispatch}
            disabled={!operator}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-[12.5px] font-semibold text-white transition"
            style={{
              background: "var(--ds-advisory)",
              opacity: operator ? 1 : 0.45,
              cursor: operator ? "pointer" : "not-allowed",
            }}
          >
            <User className="w-4 h-4" />
            {t("dispatchWorkOrderBtn")}
          </button>

          <button
            onClick={acknowledge}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-[12.5px] font-semibold"
            style={{ background: "var(--ds-surface-soft)", color: "var(--ds-text-muted)", border: "1px solid var(--ds-border-soft)" }}
          >
            <Check className="w-4 h-4" />
            {t("acknowledgeAdvice")}
          </button>

          <button
            onClick={lockProfile}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-[12.5px] font-semibold"
            style={{ background: "var(--ds-surface-soft)", color: "var(--ds-text-muted)", border: "1px solid var(--ds-border-soft)" }}
          >
            <Lock className="w-4 h-4" />
            {t("lockSimulatedProfile")}
          </button>
        </div>
      )}
    </SlidePanel>
  );
}
