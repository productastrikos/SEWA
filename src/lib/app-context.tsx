import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";
export type ThemeMode = "dark" | "light";
export type RoleId = "admin" | "shift" | "field" | "exec";
export type Sector = "water" | "gas" | "electric";

export type RoutePath =
  | "/"
  | "/assets"
  | "/simulator"
  | "/assistant"
  | "/governance"
  | "/dma"
  | "/quality"
  | "/executive"
  | "/gas"
  | "/gas/assets"
  | "/gas/simulator"
  | "/gas/assistant"
  | "/gas/governance"
  | "/gas/dma"
  | "/gas/quality"
  | "/electric";

export const SECTOR_HOME: Record<Sector, RoutePath> = {
  water: "/",
  gas: "/gas",
  electric: "/electric",
};

export type AuthUser = {
  id: RoleId;
  username: string;
  displayName: string;
  roleLabel: string;
  roleTitle: string;
  clearance: string;
  scope: string;
  routes: RoutePath[];
  shortTitle: string;
};

// Right-side Advisory Panel — spawned from the automated advisory box on
// any Asset Detail view (Water / Gas). Each item can expand into a nested
// diagnostic breakdown with an [ Assign Task ] action.
export type AdvisoryItem = {
  id: string;
  title: string;
  titleAr: string;
  severity: "info" | "warning" | "danger";
  category: string;
  categoryAr: string;
  summary: string;
  summaryAr: string;
  diagnostic: string;
  diagnosticAr: string;
  coordinate: string;
  history: string;
  historyAr: string;
};

export type AdvisoryPanelData = {
  assetId: string;
  assetTag: string;
  sectorLabel: string;
  items: AdvisoryItem[];
};

// Right-side Assign Alert Panel — spawned from any alarm row in an Active
// Shift Critical Fault Queue (Water / Gas).
export type AlertPanelAlarm = {
  id: string;
  ts: string;
  asset: string;
  severity: 1 | 2 | 3;
  description: string;
  descriptionAr: string;
  ack: boolean;
};

export type AlertPanelData = {
  alarm: AlertPanelAlarm;
  sectorLabel: string;
  sopOptions: string[];
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  sector: Sector;
  setSector: (s: Sector) => void;
  isaMode: boolean;
  setIsaMode: (v: boolean) => void;
  authUser: AuthUser | null;
  login: (username: string, password: string) => { ok: boolean; message?: string };
  logout: () => void;
  hasAccess: (route: string) => boolean;
  availableRoutes: RoutePath[];
  t: (k: keyof typeof STRINGS.en) => string;
  advisoryPanel: AdvisoryPanelData | null;
  openAdvisoryPanel: (data: AdvisoryPanelData) => void;
  closeAdvisoryPanel: () => void;
  alertPanel: AlertPanelData | null;
  openAlertPanel: (data: AlertPanelData) => void;
  closeAlertPanel: () => void;
  // Kept in sync by whichever Asset Detail page is currently mounted (Water
  // or Gas), so the header's global Advisory button always has a live
  // target to open — not just the trigger inside the asset pane itself.
  currentAdvisoryContext: AdvisoryPanelData | null;
  setCurrentAdvisoryContext: (data: AdvisoryPanelData | null) => void;
};

const STRINGS = {
  en: {
    appTitle: "Project WAVE — SEWA Operations Console",
    subtitle: "Sharjah Electricity, Water & Gas Authority",
    nav_hub: "Navigation Hub",
    nav_assets: "Asset Diagnostic Matrix",
    nav_sim: "Hydraulic Twin Simulator",
    nav_chat: "Operations Chat Assistant",
    nav_gov: "Governance & Security",
    nav_dma: "DMA Water Audit",
    nav_quality: "Water Quality & LIMS",
    nav_exec: "Executive & Energy",
    themeLabel: "Light mode",
    langLabel: "العربية",
    role: "Role",
    clearance: "Clearance",
    user: "Operator",
    production: "Total Emirate Production",
    critical: "Active Sev-1 Alarms",
    availability: "Telemetry Availability",
    tunnel: "Network Tunnel Stability",
    search: "Search assets, tags, locations…",
    viewDetails: "View Details",
    activeShift: "Active Shift Critical Fault Queue",
    asset: "Asset",
    location: "Location",
    link: "Link Quality",
    status: "Status",
    time: "Timestamp",
    severity: "Severity",
    description: "Description",
    ack: "Acknowledge",
    scenarios: "Emergency Scenario Triggers",
    runSim: "Simulate Emergency Closure",
    riskMatrix: "Critical Facility Outage Risk Matrix",
    facility: "Facility",
    impact: "Impact",
    eta: "ETA to Collapse",
    prompt: "Ask WAVE-GPT about SOPs, tags, or live telemetry…",
    send: "Send",
    ptp: "PTP Master Clock Drift",
    firewall: "Firewall Block Rate",
    replication: "DR Replication Lag",
    mnf: "Minimum Night Flow Window (02:00 – 04:00)",
    labWarn: "Lab Drift Diagnostic Warning",
    draftSap: "Draft SAP Work Order",
    energy: "Specific Energy Consumption",
    peakLoad: "Peak Load Avoidance",
    isaLabel: "ISA-101 HPD",
    isaHint: "High-Performance Display · normal-state gray, abnormal-state color",
    categoryFilter: "Category",
    allCategories: "All Categories",
    commissioning: "Commissioning",
    passiveNode: "Passive telemetry node",
    engineeringPrompts: "Engineering Advisory Prompts",
    draftSapMaint: "[ Draft SAP Maintenance Work Order ]",
    sapDrafted: "SAP WO-4482301 drafted — Mechanical seal inspection, PMP-HMDPS-02",
    loginTitle: "Secure operator sign-in",
    loginSubtitle: "Credential verification required for controlled access to the SEWA control room.",
    username: "Username",
    password: "Password",
    signIn: "Sign in",
    logout: "Log out",
    accessDenied: "Access denied",
    accessBlocked: "Your clearance does not permit this workspace. Redirecting to your permitted control room view…",
    credentialsHint: "Use the role-specific credentials below to authenticate.",
    accessibilityMatrix: "Permission matrix",
    loggedUserLabel: "Logged User",
    sector_water: "Potable Water Sector",
    sector_gas: "Natural Gas Sector",
    sector_electric: "Electrical Power Grid Sector",
    nav_gas_hub: "Gas Network Navigation Hub",
    nav_gas_assets: "Gas Asset Matrix",
    nav_gas_sim: "Pressure Regime Simulator",
    nav_gas_chat: "Bilingual Chat Assistant",
    nav_gas_gov: "Governance & Security Health",
    nav_gas_dma: "Gas Network Audit Ledger",
    nav_gas_quality: "Gas Quality & Odorization View",
    nav_electric_hub: "Electrical Power Grid",
    electricComingSoonTitle: "Electrical Power Grid Sector — Coming Soon",
    electricComingSoonBody: "The Electrical Power Grid control-room workspace is being commissioned. The sector switcher, theme accent, and layout context are live; grid telemetry pages will land in a future release.",
    outputFlowRate: "Output Flow Rate",
    deliveryPressure: "Delivery Pressure",
    opsAdvice: "On-Premises Operations Advice",
    advisoryPanelTitle: "AI Advisory",
    openAdvisory: "AI Advisory",
    aiAdvisorySubtitle: "AI-generated recommendations from live telemetry",
    detailViewLabel: "Detail View",
    predictiveInsights: "Predictive insights",
    backToAllAdvisories: "Back to all advisories",
    signalMetric: "Signal Metric",
    recommendedAction: "Recommended Action",
    assignToFieldOperator: "Assign to Field Operator",
    selectRegisteredUser: "Select registered user…",
    dispatchWorkOrderBtn: "Dispatch Work Order",
    acknowledgeAdvice: "Acknowledge Advice",
    lockSimulatedProfile: "Lock Simulated Profile",
    refLabel: "Ref",
    adviceAcknowledgedToast: "Advisory acknowledged",
    profileLockedToast: "Simulated profile locked for audit",
    assignTask: "[ Assign Task ]",
    assignTaskTitle: "Assign Maintenance Task",
    fieldCrew: "Assignee / Field Crew Team",
    priorityLevel: "Priority Level Adjustment",
    sopChecklist: "Standard Operating Procedure Checklist",
    dispatchWorkOrder: "[ Dispatch Emergency Work Order ]",
    alarmTag: "Alarm Tag ID",
    timestampLabel: "Sub-second Timestamp",
    qualityState: "Quality State Validation",
    assetIdLabel: "Standardized SEWA Asset ID",
    assignAlertTitle: "Assign Alert",
    technicalDescription: "Technical Description",
    assignSubmit: "Assign",
    cancelLabel: "Cancel",
    dispatchToast: "Work order dispatched to SAP Integration Suite",
    taskAssignedToast: "Maintenance task assigned",
    coordinateLabel: "Valve / Breaker Coordinate",
    historicalContext: "Historical Context",
    diagnosticData: "Diagnostic Data",
    qualityGood: "GOOD",
    qualityUncertain: "UNCERTAIN",
  },
  ar: {
    appTitle: "مشروع WAVE — وحدة تحكم عمليات هيئة كهرباء ومياه وغاز الشارقة",
    subtitle: "هيئة كهرباء ومياه وغاز الشارقة",
    nav_hub: "مركز الملاحة",
    nav_assets: "مصفوفة تشخيص الأصول",
    nav_sim: "محاكي التوأم الهيدروليكي",
    nav_chat: "مساعد محادثة العمليات",
    nav_gov: "الحوكمة والأمن",
    nav_dma: "تدقيق مياه المنطقة",
    nav_quality: "جودة المياه والمختبر",
    nav_exec: "التنفيذي والطاقة",
    themeLabel: "الوضع الفاتح",
    langLabel: "English",
    role: "الدور",
    clearance: "التصريح",
    user: "المشغل",
    production: "إجمالي إنتاج الإمارة",
    critical: "إنذارات حرجة نشطة",
    availability: "توافر القياس عن بعد",
    tunnel: "استقرار نفق الشبكة",
    search: "ابحث عن الأصول والمواقع…",
    viewDetails: "عرض التفاصيل",
    activeShift: "قائمة الأعطال الحرجة للنوبة النشطة",
    asset: "الأصل",
    location: "الموقع",
    link: "جودة الاتصال",
    status: "الحالة",
    time: "الوقت",
    severity: "الخطورة",
    description: "الوصف",
    ack: "إقرار",
    scenarios: "مشغلات سيناريو الطوارئ",
    runSim: "محاكاة إغلاق الطوارئ",
    riskMatrix: "مصفوفة مخاطر انقطاع المرافق الحرجة",
    facility: "المنشأة",
    impact: "التأثير",
    eta: "الوقت المتوقع للانهيار",
    prompt: "اسأل WAVE-GPT عن الإجراءات أو القياسات…",
    send: "إرسال",
    ptp: "انحراف ساعة PTP الرئيسية",
    firewall: "معدل حظر جدار الحماية",
    replication: "تأخر النسخ الاحتياطي DR",
    mnf: "نافذة الحد الأدنى للتدفق الليلي (02:00 – 04:00)",
    labWarn: "تحذير انحراف المختبر",
    draftSap: "مسودة أمر عمل SAP",
    energy: "استهلاك الطاقة النوعي",
    peakLoad: "تجنب حمل الذروة",
    isaLabel: "ISA-101 عرض عالي الأداء",
    isaHint: "عرض عالي الأداء · رمادي للحالة الطبيعية، ملون للحالة غير الطبيعية",
    categoryFilter: "الفئة",
    allCategories: "كل الفئات",
    commissioning: "قيد التشغيل التجريبي",
    passiveNode: "عقدة قياس عن بعد سلبية",
    engineeringPrompts: "مطالبات استشارية هندسية",
    draftSapMaint: "[ إنشاء أمر عمل صيانة SAP ]",
    sapDrafted: "تم إنشاء أمر عمل SAP رقم WO-4482301 — فحص الحشية الميكانيكية، PMP-HMDPS-02",
    loginTitle: "تسجيل دخول آمن للمشغل",
    loginSubtitle: "يلزم التحقق من الاعتمادات للوصول إلى غرفة التحكم الخاصة بسيوا.",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    signIn: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    accessDenied: "تم رفض الوصول",
    accessBlocked: "لا يسمح لك تصريحك بدخول هذه المساحة. جارٍ التحويل إلى العرض المسموح به…",
    credentialsHint: "استخدم بيانات اعتماد كل دور أدناه لتسجيل الدخول.",
    accessibilityMatrix: "مصفوفة الصلاحيات",
    loggedUserLabel: "المستخدم المسجل",
    sector_water: "قطاع مياه الشرب",
    sector_gas: "قطاع الغاز الطبيعي",
    sector_electric: "قطاع شبكة الطاقة الكهربائية",
    nav_gas_hub: "مركز ملاحة شبكة الغاز",
    nav_gas_assets: "مصفوفة أصول الغاز",
    nav_gas_sim: "محاكي نظام الضغط",
    nav_gas_chat: "مساعد المحادثة ثنائي اللغة",
    nav_gas_gov: "الحوكمة وسلامة الأمن",
    nav_gas_dma: "سجل تدقيق شبكة الغاز",
    nav_gas_quality: "جودة الغاز وإضافة الرائحة",
    nav_electric_hub: "شبكة الطاقة الكهربائية",
    electricComingSoonTitle: "قطاع شبكة الطاقة الكهربائية — قريباً",
    electricComingSoonBody: "يجري حالياً تجهيز غرفة تحكم شبكة الطاقة الكهربائية. مبدّل القطاعات ولون الواجهة والتخطيط جاهزون؛ ستتوفر صفحات القياس عن بعد للشبكة في إصدار قادم.",
    outputFlowRate: "معدل تدفق المخرج",
    deliveryPressure: "ضغط التسليم",
    opsAdvice: "إرشادات التشغيل الداخلية",
    advisoryPanelTitle: "إرشاد الذكاء الاصطناعي",
    openAdvisory: "إرشاد ذكي",
    aiAdvisorySubtitle: "توصيات مولّدة بالذكاء الاصطناعي من القياس عن بعد الحي",
    detailViewLabel: "عرض التفاصيل",
    predictiveInsights: "رؤى تنبؤية",
    backToAllAdvisories: "العودة إلى كل الإرشادات",
    signalMetric: "مؤشر الإشارة",
    recommendedAction: "الإجراء الموصى به",
    assignToFieldOperator: "تعيين لمشغل ميداني",
    selectRegisteredUser: "اختر مستخدماً مسجلاً…",
    dispatchWorkOrderBtn: "إرسال أمر العمل",
    acknowledgeAdvice: "إقرار الإرشاد",
    lockSimulatedProfile: "قفل الملف التجريبي",
    refLabel: "مرجع",
    adviceAcknowledgedToast: "تم إقرار الإرشاد",
    profileLockedToast: "تم قفل الملف التجريبي للتدقيق",
    assignTask: "[ تعيين مهمة ]",
    assignTaskTitle: "تعيين مهمة صيانة",
    fieldCrew: "المكلف / فريق الصيانة الميداني",
    priorityLevel: "تعديل مستوى الأولوية",
    sopChecklist: "قائمة إجراءات التشغيل القياسية",
    dispatchWorkOrder: "[ إرسال أمر عمل طارئ ]",
    alarmTag: "معرّف الإنذار",
    timestampLabel: "الطابع الزمني الدقيق",
    qualityState: "التحقق من حالة الجودة",
    assetIdLabel: "معرّف أصل سيوا الموحد",
    assignAlertTitle: "تعيين الإنذار",
    technicalDescription: "الوصف الفني",
    assignSubmit: "تعيين",
    cancelLabel: "إلغاء",
    dispatchToast: "تم إرسال أمر العمل إلى منصة تكامل SAP",
    taskAssignedToast: "تم تعيين مهمة الصيانة",
    coordinateLabel: "إحداثيات الصمام / القاطع",
    historicalContext: "السياق التاريخي",
    diagnosticData: "بيانات التشخيص",
    qualityGood: "جيدة",
    qualityUncertain: "غير مؤكدة",
  },
} as const;

const STORAGE_KEY = "sewa-auth-session";
const SECTOR_STORAGE_KEY = "sewa-active-sector";

const GAS_ROUTES: RoutePath[] = [
  "/gas",
  "/gas/assets",
  "/gas/simulator",
  "/gas/assistant",
  "/gas/governance",
  "/gas/dma",
  "/gas/quality",
];
const ELECTRIC_ROUTES: RoutePath[] = ["/electric"];

const ROLE_ACCESS: Record<RoleId, RoutePath[]> = {
  admin: [
    "/",
    "/assets",
    "/simulator",
    "/assistant",
    "/governance",
    "/dma",
    "/quality",
    "/executive",
    ...GAS_ROUTES,
    ...ELECTRIC_ROUTES,
  ],
  shift: [
    "/",
    "/assets",
    "/simulator",
    "/assistant",
    "/governance",
    "/dma",
    "/quality",
    ...GAS_ROUTES,
    ...ELECTRIC_ROUTES,
  ],
  field: ["/assets", "/simulator", ...GAS_ROUTES, ...ELECTRIC_ROUTES],
  exec: ["/", "/dma", "/executive", ...GAS_ROUTES, ...ELECTRIC_ROUTES],
};

const ROLE_PROFILES: Record<RoleId, Omit<AuthUser, "routes">> = {
  admin: {
    id: "admin",
    username: "sewa.admin.manager",
    displayName: "Aisha Al Maktoum",
    roleLabel: "ROLE: SEWA ADMIN MANAGER",
    roleTitle: "SEWA Admin Manager",
    clearance: "Level 9 · Master Override",
    scope: "Full network access across all 8 workspace pages",
    shortTitle: "Admin Specialist",
  },
  shift: {
    id: "shift",
    username: "sewa.shift.engineer",
    displayName: "Dr. Sandeep Gupta",
    roleLabel: "ROLE: SEWA SHIFT ENGINEER",
    roleTitle: "SEWA Shift Engineer",
    clearance: "Purdue Level 3.0",
    scope: "Pages 1, 2, 3, 4, 6, 7 with advisory controls",
    shortTitle: "Shift Engineer",
  },
  field: {
    id: "field",
    username: "sewa.field.technician",
    displayName: "Lina Rahman",
    roleLabel: "ROLE: SEWA FIELD TECHNICIAN",
    roleTitle: "SEWA Field Technician",
    clearance: "Level 2 · Field Diagnostics",
    scope: "Pages 2 and 5 only for field diagnostics",
    shortTitle: "Field Tech",
  },
  exec: {
    id: "exec",
    username: "sewa.executive.directors",
    displayName: "Nadia Al Suwaidi",
    roleLabel: "ROLE: SEWA EXECUTIVE DIRECTORS",
    roleTitle: "SEWA Executive Directors",
    clearance: "Level 6 · Executive Visibility",
    scope: "Pages 1, 6, and 8 for macro-level oversight",
    shortTitle: "Executive Director",
  },
};

const getDefaultAuthUser = (): AuthUser => ({
  ...ROLE_PROFILES.shift,
  routes: ROLE_ACCESS.shift,
});

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [sector, setSector] = useState<Sector>(() => {
    if (typeof window === "undefined") return "water";
    const raw = window.localStorage.getItem(SECTOR_STORAGE_KEY);
    return raw === "gas" || raw === "electric" || raw === "water" ? raw : "water";
  });
  const [isaMode, setIsaMode] = useState(false);
  const [advisoryPanel, setAdvisoryPanel] = useState<AdvisoryPanelData | null>(null);
  const [alertPanel, setAlertPanel] = useState<AlertPanelData | null>(null);
  const [currentAdvisoryContext, setCurrentAdvisoryContext] = useState<AdvisoryPanelData | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return getDefaultAuthUser();
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultAuthUser();
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return getDefaultAuthUser();
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    // Fixed spatial layout across languages — SCADA/OT operational muscle
    // memory requires sidebars, panels, maps, and charts to stay in the same
    // physical position regardless of language. Only text content (via
    // per-string lang checks / t()) flips reading direction; the document
    // itself never mirrors.
    root.dir = "ltr";
    root.lang = lang;
    document.body.dataset.theme = theme;
    document.body.dataset.isa101 = String(isaMode);
    document.body.dataset.sector = sector;
  }, [lang, theme, isaMode, sector]);

  useEffect(() => {
    window.localStorage.setItem(SECTOR_STORAGE_KEY, sector);
  }, [sector]);

  useEffect(() => {
    if (authUser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [authUser]);

  const login = (username: string, password: string) => {
    const normalizedUser = username.trim().toLowerCase();
    const profile = Object.values(ROLE_PROFILES).find((entry) => entry.username === normalizedUser);
    const roleId = Object.entries(ROLE_PROFILES).find(([, entry]) => entry.username === normalizedUser)?.[0] as RoleId | undefined;

    if (!profile || !roleId) {
      return { ok: false, message: "Unknown operator account." };
    }

    const expectedPassword = `${profile.username.replace("sewa.", "Sewa").replace(/\./g, "@")}`;
    if (password !== expectedPassword) {
      return { ok: false, message: "Credential mismatch. Use the role-specific password shown below." };
    }

    const user: AuthUser = { ...profile, routes: ROLE_ACCESS[roleId] };
    setAuthUser(user);
    return { ok: true };
  };

  const logout = () => setAuthUser(getDefaultAuthUser());
  const hasAccess = (route: string) => {
    if (route.startsWith("/gas") || route.startsWith("/electric")) return true;
    return authUser?.routes.includes(route as RoutePath) ?? false;
  };
  const availableRoutes = useMemo(() => authUser?.routes ?? [], [authUser]);

  const openAdvisoryPanel = (data: AdvisoryPanelData) => setAdvisoryPanel(data);
  const closeAdvisoryPanel = () => setAdvisoryPanel(null);
  const openAlertPanel = (data: AlertPanelData) => setAlertPanel(data);
  const closeAlertPanel = () => setAlertPanel(null);

  const t = (k: keyof typeof STRINGS.en) => STRINGS[lang][k];

  return (
    <AppCtx.Provider
      value={{
        lang,
        setLang,
        theme,
        setTheme,
        sector,
        setSector,
        isaMode,
        setIsaMode,
        authUser,
        login,
        logout,
        hasAccess,
        availableRoutes,
        t,
        advisoryPanel,
        openAdvisoryPanel,
        closeAdvisoryPanel,
        alertPanel,
        openAlertPanel,
        closeAlertPanel,
        currentAdvisoryContext,
        setCurrentAdvisoryContext,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const v = useContext(AppCtx);
  if (!v) throw new Error("AppProvider missing");
  return v;
}
