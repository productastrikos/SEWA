import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/AppShell";
import { useApp } from "@/lib/app-context";
import { useEffect, useRef, useState } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Database,
  Wrench,
  Droplets,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title: "Bilingual Operations Chat Assistant · Project WAVE" }] }),
  component: AssistantPage,
});

const SAMPLES_EN = [
  "What is the standard startup sequence for the distribution pump at BDAPS?",
  "Show current chlorine residual at KFRRO (Khorfakkan)",
  "List Sev-1 alarms unacknowledged for over 5 minutes",
  "Draft a shift handover for the 22:00 rotation",
];
const SAMPLES_AR = [
  "ما هو تسلسل بدء التشغيل القياسي لمضخة التوزيع في BDAPS؟",
  "أظهر مستوى الكلور الحالي في KFRRO (خورفكان)",
  "اعرض إنذارات الفئة 1 غير المؤكدة لأكثر من 5 دقائق",
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
  hasSapAction?: boolean;
};

const QUESTION_CHIPS: QuestionChip[] = [
  {
    id: "asset-optimization",
    icon: Wrench,
    question: {
      en: "Why is high-lift pump PMP-HMDPS-02 showing an efficiency drop of 4.4%?",
      ar: "لماذا تظهر مضخة الرفع العالي PMP-HMDPS-02 انخفاضاً في الكفاءة بنسبة 4.4%؟",
    },
    answer: {
      en: `**Efficiency Drop Diagnostic — PMP-HMDPS-02 (WAVE-GPT Root-Cause Assist)**

☑ Hydraulic output cross-checked against BEP curve → **-4.4%** vs commissioning baseline
☑ Motor input power stable — no VFD derate detected
☐ Mechanical seal chamber pressure trending **+0.3 bar** above nominal — investigate
☐ Drive-end bearing vibration **6.1 mm/s**, up from 3.8 mm/s baseline (+62%)
☑ Suction strainer ΔP within limits — fouling ruled out

**Estimated root cause:** Mechanical seal / bearing tolerance variance consistent with early-stage wear (confidence 0.81). Recommend internal inspection at next planned outage window.`,
      ar: `**تشخيص انخفاض الكفاءة — PMP-HMDPS-02 (مساعد WAVE-GPT لتحليل السبب الجذري)**

☑ تمت مقارنة الأداء الهيدروليكي بمنحنى أفضل نقطة تشغيل (BEP) → **-4.4%** مقارنة بخط الأساس عند التشغيل التجريبي
☑ طاقة دخل المحرك مستقرة — لا يوجد تخفيض في محرك VFD
☐ ضغط حجرة الحشية الميكانيكية يتجه إلى **+0.3 بار** أعلى من المعدل الطبيعي — يتطلب التحقيق
☐ اهتزاز المحمل الجانبي المحرك **6.1 مم/ث**، ارتفاعاً من خط الأساس 3.8 مم/ث (+62%)
☑ فرق الضغط عبر مصفاة الشفط ضمن الحدود — تم استبعاد الانسداد

**السبب الجذري المقدر:** تفاوت في تحمل الحشية الميكانيكية/المحمل يتوافق مع تآكل في مرحلته المبكرة (درجة ثقة 0.81). يوصى بإجراء فحص داخلي في نافذة التوقف المخططة القادمة.`,
    },
    telemetry: [
      { tag: "PMP-HMDPS-02 · Efficiency", v: "91.2% (Δ -4.4%) ⚠" },
      { tag: "PMP-HMDPS-02 · Seal Chamber ΔP", v: "+0.3 bar ⚠" },
      { tag: "PMP-HMDPS-02 · DE Vibration", v: "6.1 mm/s ⚠" },
      { tag: "PMP-HMDPS-02 · Motor Power", v: "118 kW ✓" },
    ],
    hasSapAction: true,
  },
  {
    id: "nrw-audit",
    icon: Droplets,
    question: {
      en: "Analyze the current Minimum Night Flow (MNF) divergence in DMA-044.",
      ar: "قم بتحليل انحراف تدفق الحد الأدنى الليلي (MNF) الحالي في المنطقة DMA-044.",
    },
    answer: {
      en: `The Digital Twin engine detects a net volumetric loss variance of **+32 m³/hr** between 02:00 and 04:00. This pattern indicates an active pipeline structural crack on the main transmission line near Industrial Zone 4.

**Recommended Action:** Dispatch field acoustical leak detection crew.`,
      ar: `يكتشف محرك التوأم الرقمي انحرافاً في فاقد الحجم الصافي بمقدار **+32 م³/ساعة** بين الساعة 02:00 و04:00. يشير هذا النمط إلى وجود تشقق هيكلي نشط في خط النقل الرئيسي بالقرب من المنطقة الصناعية 4.

**الإجراء الموصى به:** إيفاد فريق الكشف الصوتي عن التسريبات الميداني.`,
    },
    telemetry: [
      { tag: "DMA-044 · MNF (02:00–04:00)", v: "132 m³/hr (+32 vs twin) ⚠" },
      { tag: "DMA-044 · NRW", v: "18.9% ⚠" },
      { tag: "DMA-044 · Investigations", v: "1 crew dispatched" },
    ],
  },
  {
    id: "energy-tou",
    icon: Zap,
    question: {
      en: "What is our current Time-of-Use (ToU) tariff compliance rate for the Kalba pumping network?",
      ar: "ما هو معدل امتثالنا الحالي لتعرفة وقت الاستخدام (ToU) لشبكة ضخ كلباء؟",
    },
    answer: {
      en: `**ToU Tariff Compliance — Kalba Pumping Network (KLBDS · WAHUC · AGLUC · JADUC)**

Current off-peak load-shift compliance: **94.2%** of high-lift pumping hours now scheduled outside the 12:00–17:00 peak tariff window (target ≥ 90%).

Detailed analysis indicates that shifting high-lift pump operations to off-peak slots has lowered aggregate energy cost per cubic meter distributed, saving an estimated **AED 118K/day** across regional reservoirs.

Remaining gap: KLBDS Train 2 startup still triggers a brief mid-tariff draw during reservoir refill — scheduling patch recommended.`,
      ar: `**امتثال تعرفة وقت الاستخدام — شبكة ضخ كلباء (KLBDS · WAHUC · AGLUC · JADUC)**

معدل الامتثال الحالي لتحويل الحمل خارج ساعات الذروة: **94.2%** من ساعات الضخ العالي مجدولة الآن خارج نافذة تعرفة الذروة 12:00–17:00 (الهدف ≥ 90%).

يشير التحليل التفصيلي إلى أن تحويل تشغيل مضخات الرفع العالي إلى فترات خارج الذروة قد خفّض تكلفة الطاقة الإجمالية لكل متر مكعب موزع، بتوفير يقدر بـ **118 ألف درهم/يوم** عبر الخزانات الإقليمية.

الفجوة المتبقية: تسلسل بدء تشغيل KLBDS المسار 2 لا يزال يسبب سحباً قصيراً خلال تعرفة منتصف الفترة أثناء إعادة تعبئة الخزان — يوصى بتصحيح الجدولة.`,
    },
    telemetry: [
      { tag: "Kalba Network · ToU Compliance", v: "94.2% ✓" },
      { tag: "Kalba Network · SEC", v: "0.548 kWh/m³ ✓" },
      { tag: "Regional Savings", v: "AED 118K/day" },
    ],
  },
];

const CANNED_ANSWER = `**Standard Startup Sequence — BDAPS Distribution Pump (SOP-WTR-4421 rev 3)**

1. Verify upstream reservoir level at **HMYRO** ≥ 2.4 m (currently **3.18 m** ✓)
2. Confirm discharge isolation valve at **BDAPS** open ≥ 25% (currently **32%** ✓)
3. Reset motor VFD fault register; confirm winding temp < 70 °C (**68.2 °C** ✓)
4. Engage soft-start ramp @ 8 s to nominal 1,485 rpm
5. Monitor vibration for 90 s — must remain < 4.5 mm/s ISO-10816
6. Log entry to SAP CBM · notify Shift Supervisor via Teams channel

⚠️ **Advisory:** BDAPS currently reports vibration **8.4 mm/s** (Sev-1 alarm AL-8820). Do not start until root-cause cleared.`;

function AssistantPage() {
  const { t, lang } = useApp();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "WAVE-GPT online. On-premises RAG engine loaded with 12,482 SOPs, live SCADA index, and SAP CMMS. Ask in English or Arabic.",
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
            { tag: "BDAPS · Vibration", v: "8.4 mm/s ⚠" },
            { tag: "HMYRO · Reservoir Level", v: "3.18 m ✓" },
            { tag: "BDAPS · Valve Position", v: "32 % ✓" },
            { tag: "BDAPS · Winding T°", v: "68.2 °C ✓" },
          ],
        },
      ]);
      setTyping(false);
    }, 1400);
  };

  const askChip = (chip: QuestionChip) => {
    setMsgs((m) => [
      ...m,
      { role: "user", content: lang === "ar" ? chip.question.ar : chip.question.en },
    ]);
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content: lang === "ar" ? chip.answer.ar : chip.answer.en,
          telemetry: chip.telemetry,
          actions: chip.hasSapAction
            ? [
                {
                  label: t("draftSapMaint"),
                  onClick: () => toast.success(t("sapDrafted")),
                },
              ]
            : undefined,
        },
      ]);
      setTyping(false);
    }, 1200);
  };

  const samples = lang === "ar" ? SAMPLES_AR : SAMPLES_EN;

  return (
    <div className="p-6 h-full flex flex-col min-h-0">
      <PageHeader
        title={t("nav_chat")}
        subtitle="On-prem Generative AI · RAG over SOP corpus + live SCADA + SAP CMMS · No data leaves Purdue Level 3.0"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-4 flex-1 min-h-0">
        <div className="panel-accent flex flex-col min-h-0">
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-[12px] font-medium">WAVE-GPT · on-prem RAG</span>
            <span className="ms-auto text-[10px] font-mono text-ok flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse" />
              MODEL READY
            </span>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-7 h-7 rounded grid place-items-center shrink-0 ${m.role === "user" ? "bg-muted" : "bg-primary/20 border border-primary/40"}`}
                >
                  {m.role === "user" ? (
                    <UserIcon className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-accent" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-lg px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary/15 border border-primary/40"
                      : "bg-panel border border-border"
                  }`}
                >
                  {m.telemetry ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="whitespace-pre-wrap">{formatMd(m.content)}</div>
                      <div className="border-s border-border ps-3">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Database className="w-3 h-3" /> Live Telemetry
                        </div>
                        <div className="space-y-1.5">
                          {m.telemetry.map((tp, j) => (
                            <div
                              key={j}
                              className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-border/50 last:border-0"
                            >
                              <span className="text-muted-foreground">{tp.tag}</span>
                              <span className="text-accent">{tp.v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{formatMd(m.content)}</div>
                  )}
                  {m.actions && (
                    <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
                      {m.actions.map((a, j) => (
                        <button
                          key={j}
                          onClick={a.onClick}
                          className="text-[11px] font-mono px-2.5 py-1.5 rounded bg-primary text-primary-foreground hover:opacity-90 transition"
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
                <div className="w-7 h-7 rounded bg-primary/20 border border-primary/40 grid place-items-center">
                  <Bot className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="px-3.5 py-3 bg-panel border border-border rounded-lg flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={t("prompt")}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-[12.5px] focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                onClick={() => send()}
                className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-[12px] flex items-center gap-1.5"
              >
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
                    className="w-full text-start p-2.5 rounded border border-primary/30 hover:border-primary/70 hover:bg-primary/10 transition flex items-start gap-2.5"
                  >
                    <Icon className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                    <span className="text-[11.5px] leading-snug">
                      {lang === "ar" ? chip.question.ar : chip.question.en}
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Sample Queries">
            <div className="space-y-1.5">
              {samples.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  className="w-full text-start text-[11.5px] p-2.5 rounded border border-border hover:border-primary/60 hover:bg-primary/5 transition"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border text-[10.5px] text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Corpus size</span>
                <span className="font-mono">12,482 SOPs</span>
              </div>
              <div className="flex justify-between">
                <span>Embeddings</span>
                <span className="font-mono">1.4 M vectors</span>
              </div>
              <div className="flex justify-between">
                <span>Model</span>
                <span className="font-mono">WAVE-LLM-13B</span>
              </div>
              <div className="flex justify-between">
                <span>Egress</span>
                <span className="text-ok">AIR-GAPPED</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function formatMd(s: string) {
  // very light markdown: **bold**
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="text-accent">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
