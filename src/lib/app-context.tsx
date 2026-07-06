import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";
export type ThemeMode = "dark" | "light";
export type RoleId = "admin" | "shift" | "field" | "exec";

export type RoutePath = "/" | "/assets" | "/simulator" | "/assistant" | "/governance" | "/dma" | "/quality" | "/executive";

export type AuthUser = {
  id: RoleId;
  username: string;
  displayName: string;
  roleLabel: string;
  clearance: string;
  scope: string;
  routes: RoutePath[];
  shortTitle: string;
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  isaMode: boolean;
  setIsaMode: (v: boolean) => void;
  authUser: AuthUser | null;
  login: (username: string, password: string) => { ok: boolean; message?: string };
  logout: () => void;
  hasAccess: (route: string) => boolean;
  availableRoutes: RoutePath[];
  t: (k: keyof typeof STRINGS.en) => string;
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
  },
} as const;

const STORAGE_KEY = "sewa-auth-session";

const ROLE_ACCESS: Record<RoleId, RoutePath[]> = {
  admin: ["/", "/assets", "/simulator", "/assistant", "/governance", "/dma", "/quality", "/executive"],
  shift: ["/", "/assets", "/simulator", "/assistant", "/governance", "/dma", "/quality"],
  field: ["/assets", "/simulator"],
  exec: ["/", "/dma", "/executive"],
};

const ROLE_PROFILES: Record<RoleId, Omit<AuthUser, "routes">> = {
  admin: {
    id: "admin",
    username: "sewa.admin.manager",
    displayName: "Aisha Al Maktoum",
    roleLabel: "ROLE: SEWA ADMIN MANAGER",
    clearance: "Level 9 · Master Override",
    scope: "Full network access across all 8 workspace pages",
    shortTitle: "Admin Specialist",
  },
  shift: {
    id: "shift",
    username: "sewa.shift.engineer",
    displayName: "Omar Haddad",
    roleLabel: "ROLE: SEWA SHIFT ENGINEER",
    clearance: "Level 4 · Operational Advisory",
    scope: "Pages 1, 2, 3, 4, 6, 7 with advisory controls",
    shortTitle: "Shift Engineer",
  },
  field: {
    id: "field",
    username: "sewa.field.technician",
    displayName: "Lina Rahman",
    roleLabel: "ROLE: SEWA FIELD TECHNICIAN",
    clearance: "Level 2 · Field Diagnostics",
    scope: "Pages 2 and 5 only for field diagnostics",
    shortTitle: "Field Tech",
  },
  exec: {
    id: "exec",
    username: "sewa.executive.directors",
    displayName: "Nadia Al Suwaidi",
    roleLabel: "ROLE: SEWA EXECUTIVE DIRECTORS",
    clearance: "Level 6 · Executive Visibility",
    scope: "Pages 1, 6, and 8 for macro-level oversight",
    shortTitle: "Executive Director",
  },
};

const getDefaultAuthUser = (): AuthUser => ({
  ...ROLE_PROFILES.admin,
  routes: ROLE_ACCESS.admin,
});

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isaMode, setIsaMode] = useState(false);
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
    root.dir = lang === "ar" ? "rtl" : "ltr";
    root.lang = lang;
    document.body.dataset.theme = theme;
    document.body.dataset.isa101 = String(isaMode);
  }, [lang, theme, isaMode]);

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
  const hasAccess = (route: string) => authUser?.routes.includes(route as RoutePath) ?? false;
  const availableRoutes = useMemo(() => authUser?.routes ?? [], [authUser]);

  const t = (k: keyof typeof STRINGS.en) => STRINGS[lang][k];

  return (
    <AppCtx.Provider
      value={{
        lang,
        setLang,
        theme,
        setTheme,
        isaMode,
        setIsaMode,
        authUser,
        login,
        logout,
        hasAccess,
        availableRoutes,
        t,
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
