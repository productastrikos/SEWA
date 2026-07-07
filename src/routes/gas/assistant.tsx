import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/AppShell";
import { useApp } from "@/lib/app-context";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Bot, User as UserIcon, Database, Flame, Wrench } from "@/lib/icons";
import { toast } from "sonner";

export const Route = createFileRoute("/gas/assistant")({
  head: () => ({ meta: [{ title: "Bilingual Gas Operations Chat Assistant · Project WAVE" }] }),
  component: GasAssistantPage,
});

const SAMPLES_EN = [
  "What is the standard startup sequence for the regulator set at Station-2?",
  "Show current delivery pressure at Station-3",
  "List Sev-1 gas alarms unacknowledged for over 5 minutes",
  "Draft a shift handover for the 22:00 rotation",
];
const SAMPLES_AR = [
  "ما هو تسلسل بدء التشغيل القياسي لمجموعة المنظمات في المحطة-2؟",
  "أظهر ضغط التسليم الحالي في المحطة-3",
  "اعرض إنذارات الغاز من الفئة 1 غير المؤكدة لأكثر من 5 دقائق",
  "اكتب مسودة تسليم نوبة الساعة 22:00",
];

type Msg = {
  role: "user" | "assistant";
  content: string;
  telemetry?: Array<{ tag: string; v: string }>;
  actions?: Array<{ label: string; onClick: () => void }>;
};

type QuestionChip = {
  id: string;
  icon: typeof Wrench;
  question: { en: string; ar: string };
  answer: { en: string; ar: string };
  telemetry: Array<{ tag: string; v: string }>;
  hasMaintAction?: boolean;
};

const QUESTION_CHIPS: QuestionChip[] = [
  {
    id: "pressure-diag",
    icon: Wrench,
    question: {
      en: "Why is Station-3 showing a delivery pressure drop below the minimum envelope?",
      ar: "لماذا تظهر المحطة-3 انخفاضاً في ضغط التسليم عن الحد الأدنى؟",
    },
    answer: {
      en: `**Delivery Pressure Diagnostic — Station-3 (WAVE-GPT Root-Cause Assist)**

☑ Regulator inlet pressure cross-checked against nominal envelope → **-0.6 bar** vs commissioning baseline
☑ Compressor duty cycle stable — no trip detected
☐ Regulator diaphragm response time trending **+40 ms** above nominal — investigate
☐ Odorant injection skid duty cycle irregular, consistent with downstream flow disturbance
☑ Upstream trunk pressure within limits — supply-side ruled out

**Estimated root cause:** Regulator diaphragm wear consistent with early-stage degradation (confidence 0.78). Recommend on-premises inspection before re-pressurizing.`,
      ar: `**تشخيص انخفاض ضغط التسليم — المحطة-3 (مساعد WAVE-GPT لتحليل السبب الجذري)**

☑ تمت مقارنة ضغط دخول المنظم بالمعدل الطبيعي → **-0.6 بار** مقارنة بخط الأساس
☑ دورة تشغيل الضاغط مستقرة — لا يوجد توقف
☐ زمن استجابة غشاء المنظم يتجه إلى **+40 ملي ثانية** أعلى من الطبيعي — يتطلب التحقيق
☐ دورة تشغيل حقن الرائحة غير منتظمة، بما يتوافق مع اضطراب التدفق
☑ ضغط الخط الرئيسي ضمن الحدود — تم استبعاد جانب التغذية

**السبب الجذري المقدر:** تآكل غشاء المنظم يتوافق مع تدهور في مرحلته المبكرة (درجة ثقة 0.78). يوصى بإجراء فحص داخلي قبل إعادة الضغط.`,
    },
    telemetry: [
      { tag: "Station-3 · Delivery Pressure", v: "1.6 bar (Δ -0.6) ⚠" },
      { tag: "Station-3 · Output Flow Rate", v: "1,840 m³/hr" },
      { tag: "Station-3 · Regulator Response", v: "+40 ms ⚠" },
      { tag: "Station-3 · Compressor Duty", v: "Nominal ✓" },
    ],
    hasMaintAction: true,
  },
  {
    id: "odorant-audit",
    icon: Flame,
    question: {
      en: "Analyze the odorant injection irregularity flagged at Station-7.",
      ar: "قم بتحليل عدم انتظام حقن الرائحة المسجل في المحطة-7.",
    },
    answer: {
      en: `The gas quality engine detects an odorant concentration variance of **-31%** vs the 18 mg/m³ target at Station-7. This pattern indicates an injection pump calibration drift.

**Recommended Action:** Dispatch on-premises technician to recalibrate the odorant injection skid before next scheduled delivery.`,
      ar: `يكتشف محرك جودة الغاز انحرافاً في تركيز الرائحة بمقدار **-31%** عن الهدف البالغ 18 مغ/م³ في المحطة-7. يشير هذا النمط إلى انحراف في معايرة مضخة الحقن.

**الإجراء الموصى به:** إيفاد فني داخلي لإعادة معايرة وحدة حقن الرائحة قبل موعد التسليم القادم.`,
    },
    telemetry: [
      { tag: "Station-7 · Odorant Conc.", v: "12.4 mg/m³ (-31%) ⚠" },
      { tag: "Station-7 · Injection Pump Duty", v: "Irregular ⚠" },
      { tag: "Station-7 · Status", v: "Under construction" },
    ],
  },
];

const CANNED_ANSWER = `**Standard Startup Sequence — Station-2 Regulator Set (SOP-GAS-2210 rev 2)**

1. Verify upstream trunk pressure ≥ 4.2 bar (currently **4.6 bar** ✓)
2. Confirm downstream isolation valve open ≥ 25% (currently **30%** ✓)
3. Reset regulator fault register; confirm diaphragm response < 60 ms (**48 ms** ✓)
4. Engage staged pressure ramp @ 10 s to nominal delivery pressure
5. Monitor odorant concentration for 90 s — must remain within 16–20 mg/m³
6. Log entry to maintenance ledger · notify Shift Supervisor via Teams channel

⚠️ **Advisory:** Station-3 currently reports delivery pressure **1.6 bar** (Sev-1 alarm GAL-2201). Do not start until root-cause cleared.`;

function GasAssistantPage() {
  const { t, lang } = useApp();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content: "GAS-GPT online. On-premises RAG engine loaded with gas network SOPs, live SCADA index, and the coded facility registry. Ask in English or Arabic.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: q }]);
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content: CANNED_ANSWER,
          telemetry: [
            { tag: "Station-3 · Delivery Pressure", v: "1.6 bar ⚠" },
            { tag: "Station-2 · Trunk Pressure", v: "4.6 bar ✓" },
            { tag: "Station-2 · Valve Position", v: "30% ✓" },
            { tag: "Station-2 · Regulator Response", v: "48 ms ✓" },
          ],
        },
      ]);
      setTyping(false);
    }, 1400);
  };

  const askChip = (chip: QuestionChip) => {
    setMsgs((m) => [...m, { role: "user", content: lang === "ar" ? chip.question.ar : chip.question.en }]);
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content: lang === "ar" ? chip.answer.ar : chip.answer.en,
          telemetry: chip.telemetry,
          actions: chip.hasMaintAction
            ? [{ label: "[ Draft Maintenance Work Order ]", onClick: () => toast.success("Maintenance WO-GAS-2287 drafted — Regulator diaphragm inspection, Station-3") }]
            : undefined,
        },
      ]);
      setTyping(false);
    }, 1200);
  };

  const samples = lang === "ar" ? SAMPLES_AR : SAMPLES_EN;

  return (
    <div className="p-6 h-full flex flex-col min-h-0">
      <PageHeader title={t("nav_gas_chat")} subtitle="On-prem Generative AI · RAG over gas SOP corpus + live SCADA · No data leaves Purdue Level 3.0" />

      {/* Purple-accented chat surface — a deliberate accent flourish layered
          on top of the sector's amber/orange chrome, per spec. */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-4 flex-1 min-h-0">
        <div
          className="flex flex-col min-h-0 rounded-xl border"
          style={{ borderColor: "var(--ds-violet-bg)", background: "var(--ds-panel)" }}
        >
          <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: "var(--ds-border-soft)" }}>
            <Sparkles className="w-4 h-4" style={{ color: "var(--ds-violet)" }} />
            <span className="text-[12px] font-medium">GAS-GPT · on-prem RAG</span>
            <span className="ms-auto text-[10px] font-mono flex items-center gap-1" style={{ color: "var(--ds-success)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--ds-success)" }} />
              MODEL READY
            </span>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className="w-7 h-7 rounded grid place-items-center shrink-0"
                  style={
                    m.role === "user"
                      ? { background: "var(--ds-surface-soft)" }
                      : { background: "var(--ds-violet-bg)", border: "1px solid var(--ds-violet)" }
                  }
                >
                  {m.role === "user" ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" style={{ color: "var(--ds-violet)" }} />}
                </div>
                <div
                  className="max-w-[80%] rounded-lg px-3.5 py-2.5 text-[12.5px] leading-relaxed border"
                  style={
                    m.role === "user"
                      ? { background: "var(--ds-violet-bg)", borderColor: "var(--ds-violet)" }
                      : { background: "var(--ds-panel)", borderColor: "var(--ds-border-soft)" }
                  }
                >
                  {m.telemetry ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="whitespace-pre-wrap">{formatMd(m.content)}</div>
                      <div className="border-s ps-3" style={{ borderColor: "var(--ds-border-soft)" }}>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Database className="w-3 h-3" /> Live Telemetry
                        </div>
                        <div className="space-y-1.5">
                          {m.telemetry.map((tp, j) => (
                            <div key={j} className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-border/50 last:border-0">
                              <span className="text-muted-foreground">{tp.tag}</span>
                              <span style={{ color: "var(--ds-violet)" }}>{tp.v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{formatMd(m.content)}</div>
                  )}
                  {m.actions && (
                    <div className="mt-3 pt-3 border-t flex flex-wrap gap-2" style={{ borderColor: "var(--ds-border-soft)" }}>
                      {m.actions.map((a, j) => (
                        <button
                          key={j}
                          onClick={a.onClick}
                          className="text-[11px] font-mono px-2.5 py-1.5 rounded text-white hover:opacity-90 transition"
                          style={{ background: "var(--ds-violet)" }}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded grid place-items-center" style={{ background: "var(--ds-violet-bg)", border: "1px solid var(--ds-violet)" }}>
                  <Bot className="w-3.5 h-3.5" style={{ color: "var(--ds-violet)" }} />
                </div>
                <div className="px-3.5 py-3 rounded-lg border flex gap-1" style={{ borderColor: "var(--ds-border-soft)" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--ds-violet)" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--ds-violet)", animationDelay: "0.15s" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--ds-violet)", animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t p-3" style={{ borderColor: "var(--ds-border-soft)" }}>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={t("prompt")}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-[12.5px] focus:outline-none focus:ring-2"
                style={{ boxShadow: "none" }}
              />
              <button onClick={() => send()} className="px-3 py-2 rounded-md text-[12px] flex items-center gap-1.5 text-white" style={{ background: "var(--ds-violet)" }}>
                <Send className="w-3.5 h-3.5" /> {t("send")}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 min-h-0 overflow-auto">
          <Panel accent title={t("engineeringPrompts")}>
            <div className="space-y-2">
              {QUESTION_CHIPS.map((chip) => {
                const Icon = chip.icon;
                return (
                  <button
                    key={chip.id}
                    onClick={() => askChip(chip)}
                    className="w-full text-start p-2.5 rounded border transition flex items-start gap-2.5"
                    style={{ borderColor: "var(--ds-violet-bg)" }}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "var(--ds-violet)" }} />
                    <span className="text-[11.5px] leading-snug">{lang === "ar" ? chip.question.ar : chip.question.en}</span>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Sample Queries">
            <div className="space-y-1.5">
              {samples.map((s, i) => (
                <button key={i} onClick={() => send(s)} className="w-full text-start text-[11.5px] p-2.5 rounded border border-border hover:border-primary/60 hover:bg-primary/5 transition">
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border text-[10.5px] text-muted-foreground space-y-1">
              <div className="flex justify-between"><span>Corpus size</span><span className="font-mono">4,120 SOPs</span></div>
              <div className="flex justify-between"><span>Model</span><span className="font-mono">GAS-LLM-7B</span></div>
              <div className="flex justify-between"><span>Egress</span><span className="text-ok">AIR-GAPPED</span></div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function formatMd(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} style={{ color: "var(--ds-violet)" }}>{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
