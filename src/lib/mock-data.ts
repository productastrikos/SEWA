import type { AdvisoryItem } from "@/lib/app-context";

export type Asset = {
  id: string;
  tag: string; // official RFP-coded identifier (Section 1.6.4) — anonymized per SEWA operational security note
  name: string;
  nameAr: string;
  domain: "Water" | "Gas";
  type:
    | "Water Production & Pumping"
    | "Water Pumping"
    | "Water Metering Point"
    | "Gas Distribution Station";
  city: string;
  cityAr: string;
  location: string; // alias of city, kept for existing consumers
  locationAr: string;
  edgeDevice: string;
  firewallRequired: "Required" | "Not Required" | "Free issued later";
  underConstruction: boolean;
  commissioned: boolean;
  passive: boolean; // Trango-logger telemetry-only node — no supervisory control authority (Sec 1.3.1.A / 1.6.5)
  link: number; // %
  status: "healthy" | "warn" | "crit";
  pressure: number; // bar
  flow: number; // m3/hr
  x: number; // map coord 0-100
  y: number;
};

export const ASSET_CATEGORIES = [
  { value: "all", label: "All Categories", labelAr: "كل الفئات" },
  {
    value: "Water Production & Pumping",
    label: "Water Production & Pumping",
    labelAr: "إنتاج وضخ المياه",
  },
  { value: "Water Pumping", label: "Water Distribution Pumping", labelAr: "ضخ توزيع المياه" },
  { value: "Water Metering Point", label: "Water Metering Node", labelAr: "نقطة قياس المياه" },
  {
    value: "Gas Distribution Station",
    label: "Gas Distribution Station",
    labelAr: "محطة توزيع الغاز",
  },
] as const;

const TYPE_AR: Record<Asset["type"], string> = {
  "Water Production & Pumping": "إنتاج وضخ المياه",
  "Water Pumping": "ضخ المياه",
  "Water Metering Point": "نقطة قياس المياه",
  "Gas Distribution Station": "محطة توزيع الغاز",
};

const CITY_AR: Record<string, string> = {
  Sharjah: "الشارقة",
  Kalba: "كلباء",
  Khorfakkan: "خورفكان",
  Dibba: "دبا الحصن",
};

// City map clusters (SVG viewBox 0-100) for GIS placement
const CLUSTERS: Record<string, { cx: number; cy: number; r: number }> = {
  Sharjah: { cx: 34, cy: 38, r: 20 },
  Kalba: { cx: 80, cy: 66, r: 11 },
  Khorfakkan: { cx: 78, cy: 24, r: 14 },
  Dibba: { cx: 91, cy: 7, r: 4 },
};

function rand(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

type RegistryRow = {
  tag: string;
  city: keyof typeof CLUSTERS;
  type: Asset["type"];
  domain: Asset["domain"];
  edgeDevice: string;
  firewallRequired: Asset["firewallRequired"];
  uc: boolean;
};

// Source of truth: SEWA_PROJECT_WAVE_RFP_2.4, Section 1.6.4 "Station-Level Asset,
// Instrumentation, and Telemetry Reality" — 34 Water stations + 8 Gas stations = 42 assets.
const REGISTRY: RegistryRow[] = [
  // --- Water: Production & High-Lift Pumping (9) ---
  {
    tag: "HMYRO",
    city: "Sharjah",
    type: "Water Production & Pumping",
    domain: "Water",
    edgeDevice: "Schneider M340",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "RHMRO",
    city: "Sharjah",
    type: "Water Production & Pumping",
    domain: "Water",
    edgeDevice: "Schneider M340",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "LYYDS",
    city: "Sharjah",
    type: "Water Production & Pumping",
    domain: "Water",
    edgeDevice: "Trango Loggers",
    firewallRequired: "Not Required",
    uc: false,
  },
  {
    tag: "MHDRO",
    city: "Sharjah",
    type: "Water Production & Pumping",
    domain: "Water",
    edgeDevice: "Schneider M340",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "THLRO",
    city: "Sharjah",
    type: "Water Production & Pumping",
    domain: "Water",
    edgeDevice: "Schneider M340",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "NZWRO",
    city: "Sharjah",
    type: "Water Production & Pumping",
    domain: "Water",
    edgeDevice: "Schneider M340",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "SBNRO",
    city: "Sharjah",
    type: "Water Production & Pumping",
    domain: "Water",
    edgeDevice: "Schneider M340",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "KLBDS",
    city: "Kalba",
    type: "Water Production & Pumping",
    domain: "Water",
    edgeDevice: "Schneider M340",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "KFRRO",
    city: "Khorfakkan",
    type: "Water Production & Pumping",
    domain: "Water",
    edgeDevice: "Required",
    firewallRequired: "Required",
    uc: false,
  },

  // --- Water: Distribution Pumping (10) ---
  {
    tag: "FLJPS",
    city: "Sharjah",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Schneider M340",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "BDAPS",
    city: "Sharjah",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Schneider M340",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "HMDPS",
    city: "Sharjah",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Schneider M340",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "HMTPS",
    city: "Sharjah",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Schneider M340",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "ZBRPS",
    city: "Sharjah",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Schneider M340",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "PS123",
    city: "Khorfakkan",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Required",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "LLYPS",
    city: "Khorfakkan",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Schneider M340",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "QDSPS",
    city: "Khorfakkan",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Schneider M340",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "BRWST",
    city: "Khorfakkan",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Schneider M340",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "SHBPS",
    city: "Khorfakkan",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Required",
    firewallRequired: "Required",
    uc: false,
  },

  // --- Water: Metering Points / Trango data loggers (8) ---
  {
    tag: "TQAIN",
    city: "Sharjah",
    type: "Water Metering Point",
    domain: "Water",
    edgeDevice: "Trango Loggers",
    firewallRequired: "Not Required",
    uc: false,
  },
  {
    tag: "ETHIN",
    city: "Sharjah",
    type: "Water Metering Point",
    domain: "Water",
    edgeDevice: "Trango Loggers",
    firewallRequired: "Not Required",
    uc: false,
  },
  {
    tag: "UTCIN",
    city: "Sharjah",
    type: "Water Metering Point",
    domain: "Water",
    edgeDevice: "Trango Loggers",
    firewallRequired: "Not Required",
    uc: false,
  },
  {
    tag: "ALPIN",
    city: "Kalba",
    type: "Water Metering Point",
    domain: "Water",
    edgeDevice: "Trango Loggers",
    firewallRequired: "Not Required",
    uc: false,
  },
  {
    tag: "TQAIN",
    city: "Kalba",
    type: "Water Metering Point",
    domain: "Water",
    edgeDevice: "Trango Loggers",
    firewallRequired: "Not Required",
    uc: false,
  },
  {
    tag: "ETHIN",
    city: "Kalba",
    type: "Water Metering Point",
    domain: "Water",
    edgeDevice: "Trango Loggers",
    firewallRequired: "Not Required",
    uc: false,
  },
  {
    tag: "TQAIN",
    city: "Khorfakkan",
    type: "Water Metering Point",
    domain: "Water",
    edgeDevice: "Trango Loggers",
    firewallRequired: "Not Required",
    uc: false,
  },
  {
    tag: "ETHIN",
    city: "Khorfakkan",
    type: "Water Metering Point",
    domain: "Water",
    edgeDevice: "Trango Loggers",
    firewallRequired: "Not Required",
    uc: false,
  },

  // --- Water: Under Construction (7) ---
  {
    tag: "ZBRUC",
    city: "Sharjah",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Free issued later",
    firewallRequired: "Free issued later",
    uc: true,
  },
  {
    tag: "BDAUC",
    city: "Sharjah",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Free issued later",
    firewallRequired: "Free issued later",
    uc: true,
  },
  {
    tag: "BRRUC",
    city: "Sharjah",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Free issued later",
    firewallRequired: "Free issued later",
    uc: true,
  },
  {
    tag: "HMYIW",
    city: "Sharjah",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Free issued later",
    firewallRequired: "Free issued later",
    uc: true,
  },
  {
    tag: "AGLUC",
    city: "Kalba",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Free issued later",
    firewallRequired: "Free issued later",
    uc: true,
  },
  {
    tag: "WAHUC",
    city: "Kalba",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Free issued later",
    firewallRequired: "Free issued later",
    uc: true,
  },
  {
    tag: "JADUC",
    city: "Kalba",
    type: "Water Pumping",
    domain: "Water",
    edgeDevice: "Free issued later",
    firewallRequired: "Free issued later",
    uc: true,
  },

  // --- Gas: Coded Infrastructure Facilities (8) ---
  {
    tag: "Station-1",
    city: "Sharjah",
    type: "Gas Distribution Station",
    domain: "Gas",
    edgeDevice: "Required",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "Station-2",
    city: "Sharjah",
    type: "Gas Distribution Station",
    domain: "Gas",
    edgeDevice: "Required",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "Station-3",
    city: "Sharjah",
    type: "Gas Distribution Station",
    domain: "Gas",
    edgeDevice: "Required",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "Station-4",
    city: "Kalba",
    type: "Gas Distribution Station",
    domain: "Gas",
    edgeDevice: "Required",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "Station-5",
    city: "Khorfakkan",
    type: "Gas Distribution Station",
    domain: "Gas",
    edgeDevice: "Required",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "Station-6",
    city: "Dibba",
    type: "Gas Distribution Station",
    domain: "Gas",
    edgeDevice: "Required",
    firewallRequired: "Required",
    uc: false,
  },
  {
    tag: "Station-7",
    city: "Sharjah",
    type: "Gas Distribution Station",
    domain: "Gas",
    edgeDevice: "Required",
    firewallRequired: "Required",
    uc: true,
  },
  {
    tag: "Station-8",
    city: "Sharjah",
    type: "Gas Distribution Station",
    domain: "Gas",
    edgeDevice: "Required",
    firewallRequired: "Required",
    uc: true,
  },
];

export const ASSETS: Asset[] = (() => {
  const r = rand(42);
  return REGISTRY.map((row, i) => {
    const cluster = CLUSTERS[row.city];
    const angle = r() * Math.PI * 2;
    const radius = r() * cluster.r;
    const passive = row.edgeDevice === "Trango Loggers";
    const commissioned = !row.uc;

    const link = commissioned ? 70 + Math.floor(r() * 30) : 0;
    const status: Asset["status"] = !commissioned
      ? "warn"
      : link < 78
        ? "crit"
        : link < 88
          ? "warn"
          : "healthy";

    return {
      id: `A${String(i + 1).padStart(3, "0")}`,
      tag: row.tag,
      name: `${row.type} · ${row.tag}`,
      nameAr: `${TYPE_AR[row.type]} · ${row.tag}`,
      domain: row.domain,
      type: row.type,
      city: row.city,
      cityAr: CITY_AR[row.city],
      location: row.city,
      locationAr: CITY_AR[row.city],
      edgeDevice: row.edgeDevice,
      firewallRequired: row.firewallRequired,
      underConstruction: row.uc,
      commissioned,
      passive,
      link,
      status,
      pressure: commissioned ? +(2.0 + r() * 4).toFixed(2) : 0,
      flow: commissioned ? Math.floor(200 + r() * 3800) : 0,
      x: +(cluster.cx + Math.cos(angle) * radius).toFixed(1),
      y: +(cluster.cy + Math.sin(angle) * radius).toFixed(1),
    };
  });
})();

// Domain-scoped views over the shared asset registry — Water sector pages
// only show the 34 water stations; Gas sector pages only show the 8 coded
// Gas distribution stations (Station-1 … Station-8).
export const WATER_ASSETS: Asset[] = ASSETS.filter((a) => a.domain === "Water");
export const GAS_ASSETS: Asset[] = ASSETS.filter((a) => a.domain === "Gas");

export type Alarm = {
  id: string;
  ts: string;
  asset: string;
  severity: 1 | 2 | 3;
  description: string;
  descriptionAr: string;
  ack: boolean;
};

export const ALARMS: Alarm[] = [
  {
    id: "AL-8821",
    ts: "14:32:07.412",
    asset: "HMYRO",
    severity: 1,
    description: "RO membrane differential pressure exceeds 3.2 bar",
    descriptionAr: "الضغط التفاضلي لغشاء التناضح يتجاوز 3.2 بار",
    ack: false,
  },
  {
    id: "AL-8820",
    ts: "14:31:44.098",
    asset: "BDAPS",
    severity: 1,
    description: "High-lift pump vibration 8.4 mm/s ISO alarm",
    descriptionAr: "اهتزاز مضخة الرفع العالي 8.4 مم/ث",
    ack: false,
  },
  {
    id: "AL-8819",
    ts: "14:29:12.844",
    asset: "PS123",
    severity: 2,
    description: "Station valve position feedback mismatch",
    descriptionAr: "عدم تطابق ملاحظات موضع الصمام",
    ack: false,
  },
  {
    id: "AL-8818",
    ts: "14:27:03.220",
    asset: "KFRRO",
    severity: 2,
    description: "Reservoir level dropping 0.8 m/hr",
    descriptionAr: "انخفاض مستوى الخزان 0.8 م/ساعة",
    ack: true,
  },
  {
    id: "AL-8817",
    ts: "14:24:51.005",
    asset: "LYYDS",
    severity: 1,
    description: "Trango aggregation link degraded (packet loss 12%)",
    descriptionAr: "تدهور رابط تجميع ترانجو للقياس عن بعد",
    ack: false,
  },
  {
    id: "AL-8816",
    ts: "14:21:39.771",
    asset: "SHBPS",
    severity: 3,
    description: "Booster outlet chlorine trending low",
    descriptionAr: "انخفاض كلور مخرج المعزز",
    ack: true,
  },
  {
    id: "AL-8815",
    ts: "14:18:22.113",
    asset: "KLBDS",
    severity: 2,
    description: "Motor winding temperature 82°C rising",
    descriptionAr: "درجة حرارة ملف المحرك 82°م ترتفع",
    ack: false,
  },
  {
    id: "AL-8814",
    ts: "14:14:58.902",
    asset: "RHMRO",
    severity: 3,
    description: "Turbidity NTU spike 0.42 → 0.61",
    descriptionAr: "ارتفاع العكارة",
    ack: true,
  },
];

export const KPI = {
  production: 428_500, // m3/hr
  criticalCount: ALARMS.filter((a) => a.severity === 1 && !a.ack).length,
  availability: 99.87,
  tunnel: 98.4,
};

// time series
export function series(n = 60, base = 100, amp = 10, seed = 1) {
  const r = rand(seed);
  return Array.from({ length: n }, (_, i) => ({
    t: `${String(Math.floor(i / 4)).padStart(2, "0")}:${String((i % 4) * 15).padStart(2, "0")}`,
    v: +(base + Math.sin(i / 4) * amp + (r() - 0.5) * amp * 0.6).toFixed(2),
  }));
}

export function diurnal(n = 48, seed = 7) {
  const r = rand(seed);
  return Array.from({ length: n }, (_, i) => {
    const hour = (i / 2) % 24;
    const inMnfWindow = hour >= 2 && hour < 4;
    const predicted = 1200 + Math.sin(((hour - 6) / 24) * Math.PI * 2) * 400 + 500;
    const actual = predicted + (r() - 0.5) * 80 + (inMnfWindow ? 90 : 0);
    const predictedR = +predicted.toFixed(0);
    const actualR = +actual.toFixed(0);
    // Divergence band: only shaded within the MNF window, and only when
    // actual exceeds predicted (a leak signature) — never a below-baseline dip.
    // Rendered as a stacked area (gapBase invisible + gapAmount visible) so
    // the fill sits exactly between the two curves rather than the full plot.
    const gapAmount = inMnfWindow ? Math.max(0, actualR - predictedR) : 0;
    const gapBase = actualR - gapAmount;
    return {
      t: `${String(Math.floor(hour)).padStart(2, "0")}:${hour % 1 ? "30" : "00"}`,
      hour,
      predicted: predictedR,
      actual: actualR,
      gapBase,
      gapAmount,
    };
  });
}

export const SCENARIOS = [
  { id: "desal", label: "Desalination Source Outage", labelAr: "انقطاع مصدر التحلية" },
  { id: "grid", label: "Power Grid Failure", labelAr: "فشل شبكة الكهرباء" },
  { id: "flood", label: "Flash Flood Inundation", labelAr: "فيضان مفاجئ" },
  { id: "contam", label: "Contamination Emergency", labelAr: "طوارئ تلوث" },
];

export const RISK_MATRIX = [
  {
    facility: "Al Qasimi Hospital",
    type: "Critical Care Clinic",
    impact: "Critical",
    eta: "18 min",
    pop: 1200,
    bypass: "Reroute via KLBDS cross-tie; activate emergency tanker standby",
  },
  {
    facility: "Muwaileh Primary Health Clinic",
    type: "Community Clinic",
    impact: "Critical",
    eta: "22 min",
    pop: 3400,
    bypass: "Isolate DMA-021 boundary valve; gravity-feed from Al Nahda elevated tank",
  },
  {
    facility: "Sharjah University City",
    type: "Institutional",
    impact: "High",
    eta: "31 min",
    pop: 42000,
    bypass: "Cross-connect to ZBRPS distribution main within 15 min",
  },
  {
    facility: "Al Jazzat Community Clinic",
    type: "Community Clinic",
    impact: "High",
    eta: "44 min",
    pop: 2100,
    bypass: "Dispatch tanker fleet; open bypass loop via BDAPS",
  },
  {
    facility: "Industrial Zone 4",
    type: "Industrial",
    impact: "High",
    eta: "1 h 05 min",
    pop: 8500,
    bypass: "Throttle non-critical industrial draw; prioritize potable feed",
  },
  {
    facility: "Muwaileh Residential",
    type: "Residential",
    impact: "Medium",
    eta: "1 h 40 min",
    pop: 27000,
    bypass: "Sequential DMA isolation; restore via off-peak reservoir refill",
  },
];

// DMA registry — District Metered Area boundary shapes rendered on the GIS overview
export const DMA_ZONES = [
  {
    id: "DMA-SHJ-01",
    label: "Sharjah Central DMA",
    path: "M10,20 Q30,10 55,25 T90,30 L88,55 Q60,68 30,60 T8,50 Z",
    fill: "rgba(91,141,224,0.08)",
    stroke: "rgba(91,141,224,0.35)",
    labelX: 30,
    labelY: 32,
  },
  {
    id: "DMA-KLB-02",
    label: "Kalba Coastal DMA",
    path: "M15,60 Q40,55 65,70 T92,75 L90,90 L20,92 Z",
    fill: "rgba(14,165,233,0.06)",
    stroke: "rgba(14,165,233,0.30)",
    labelX: 55,
    labelY: 78,
  },
  {
    id: "DMA-KFK-03",
    label: "Khorfakkan DMA",
    path: "M55,10 Q75,15 90,20 L92,40 Q75,42 60,35 Z",
    fill: "rgba(20,184,166,0.06)",
    stroke: "rgba(20,184,166,0.30)",
    labelX: 75,
    labelY: 25,
  },
];

/* ============================================================
   GAS SECTOR — Natural Gas Sector mock data
   8 coded facilities (Station-1 … Station-8) sourced from GAS_ASSETS.
   Reuses Asset.flow as Output Flow Rate (m³/hr) and Asset.pressure as
   Delivery Pressure (Bar) for the Gas Asset Detail page.
   ============================================================ */

export const GAS_KPI = {
  totalThroughput: GAS_ASSETS.reduce((sum, a) => sum + a.flow, 0),
  criticalCount: GAS_ASSETS.filter((a) => a.status === "crit").length,
  availability: 99.62,
  networkPressureStability: 97.8,
};

export const GAS_ALARMS: Alarm[] = [
  {
    id: "GAL-2201",
    ts: "14:12:18.402",
    asset: "Station-3",
    severity: 1,
    description: "Delivery pressure drop below 2.1 bar minimum envelope",
    descriptionAr: "انخفاض ضغط التسليم عن الحد الأدنى 2.1 بار",
    ack: false,
  },
  {
    id: "GAL-2200",
    ts: "14:08:52.114",
    asset: "Station-7",
    severity: 2,
    description: "Odorant injection pump duty cycle irregular",
    descriptionAr: "دورة تشغيل مضخة حقن الرائحة غير منتظمة",
    ack: false,
  },
  {
    id: "GAL-2199",
    ts: "13:57:03.881",
    asset: "Station-5",
    severity: 2,
    description: "Regulator outlet pressure surge +0.4 bar transient",
    descriptionAr: "ارتفاع مؤقت في ضغط مخرج المنظم +0.4 بار",
    ack: true,
  },
  {
    id: "GAL-2198",
    ts: "13:41:27.509",
    asset: "Station-8",
    severity: 3,
    description: "Under-construction station — telemetry link pending commissioning",
    descriptionAr: "محطة قيد الإنشاء — رابط القياس عن بعد بانتظار التشغيل التجريبي",
    ack: true,
  },
];

export const GAS_SCENARIOS = [
  { id: "valve", label: "Emergency Valve Closure", labelAr: "إغلاق طارئ للصمام" },
  { id: "compressor", label: "Compressor Trip", labelAr: "توقف ضاغط الغاز" },
  { id: "surge", label: "Pressure Surge Event", labelAr: "حدث ارتفاع الضغط" },
  { id: "odorant", label: "Odorant Injection Fault", labelAr: "عطل حقن الرائحة" },
];

export const GAS_RISK_MATRIX = [
  {
    facility: "Sharjah Industrial Zone 2 (Gas-fed boilers)",
    type: "Industrial",
    impact: "Critical",
    eta: "12 min",
    pop: 6200,
    bypass: "Cross-feed from Station-2 regulator set; open bypass loop within 6 min",
  },
  {
    facility: "Kalba District Distribution Ring",
    type: "Residential / Commercial",
    impact: "High",
    eta: "26 min",
    pop: 9400,
    bypass: "Isolate Station-4 downstream segment; maintain ring-feed from Station-5",
  },
  {
    facility: "Khorfakkan Coastal Supply Loop",
    type: "Residential",
    impact: "Medium",
    eta: "48 min",
    pop: 5100,
    bypass: "Sequential regulator throttling; restore via Station-5 reserve capacity",
  },
];

// Gas Network Audit Ledger — pressure-loss / leak-survey equivalent of the
// water DMA leakage ledger, tracked per coded facility instead of per DMA.
export const GAS_AUDIT_LEDGER = [
  { id: "Station-1", name: "Sharjah North Gate Station", loss: 1.2, mnp: 18, cons: 4200 },
  { id: "Station-2", name: "Sharjah Central Regulating Station", loss: 2.4, mnp: 26, cons: 5600 },
  { id: "Station-3", name: "Sharjah East Metering Station", loss: 6.8, mnp: 61, cons: 3100 },
  { id: "Station-4", name: "Kalba Distribution Station", loss: 3.1, mnp: 22, cons: 2800 },
  { id: "Station-5", name: "Khorfakkan Coastal Station", loss: 2.0, mnp: 15, cons: 2100 },
  { id: "Station-6", name: "Dibba Terminal Station", loss: 1.6, mnp: 12, cons: 1400 },
];

export const GAS_AUDIT_ZONES = [
  {
    id: "GAZ-SHJ-01",
    label: "Sharjah Gas Distribution Zone",
    path: "M10,20 Q30,10 55,25 T90,30 L88,55 Q60,68 30,60 T8,50 Z",
    fill: "rgba(245,158,11,0.08)",
    stroke: "rgba(245,158,11,0.35)",
    labelX: 30,
    labelY: 32,
  },
  {
    id: "GAZ-KLB-02",
    label: "Kalba Gas Ring",
    path: "M15,60 Q40,55 65,70 T92,75 L90,90 L20,92 Z",
    fill: "rgba(234,88,12,0.06)",
    stroke: "rgba(234,88,12,0.30)",
    labelX: 55,
    labelY: 78,
  },
  {
    id: "GAZ-KFK-03",
    label: "Khorfakkan Gas Loop",
    path: "M55,10 Q75,15 90,20 L92,40 Q75,42 60,35 Z",
    fill: "rgba(217,119,6,0.06)",
    stroke: "rgba(217,119,6,0.30)",
    labelX: 75,
    labelY: 25,
  },
];

// Gas Quality & Odorization — LIMS-equivalent lab cross-validation dataset
export const GAS_QUALITY_SAMPLES = [
  { id: "GQ-2026-3311", site: "Station-1", odorant: 18.2, calorific: 38.4, moisture: 0.12, delta: "+2%", flag: "OK" },
  { id: "GQ-2026-3310", site: "Station-3", odorant: 12.4, calorific: 37.9, moisture: 0.21, delta: "-31%", flag: "DRIFT" },
  { id: "GQ-2026-3309", site: "Station-4", odorant: 17.6, calorific: 38.6, moisture: 0.10, delta: "+1%", flag: "OK" },
  { id: "GQ-2026-3308", site: "Station-5", odorant: 18.0, calorific: 38.2, moisture: 0.14, delta: "0%", flag: "OK" },
  { id: "GQ-2026-3307", site: "Station-2", odorant: 17.9, calorific: 38.1, moisture: 0.13, delta: "-1%", flag: "OK" },
];

// Gas-specific on-premises operations advisory copy, keyed by asset tag —
// surfaced on the Gas Asset Detail split-pane per the coded facility.
export const GAS_OPS_ADVICE: Record<string, string> = {
  "Station-1": "Delivery pressure and output flow rate are within nominal envelope. Continue standard 4-hour regulator inspection rounds; no on-premises intervention required this shift.",
  "Station-2": "Output flow rate trending toward upper distribution limit. Recommend throttling upstream regulator by 4% and logging a preventive inspection of the pressure-reducing valve train.",
  "Station-3": "Delivery pressure has fallen below the 2.1 bar minimum envelope (Sev-1 GAL-2201). Dispatch an on-premises technician immediately to inspect the regulator diaphragm and odorant injection skid before re-pressurizing.",
  "Station-4": "Output flow rate and delivery pressure nominal. Cross-tie valve to Station-5 should remain in standby (closed) position per current ring-feed configuration.",
  "Station-5": "Minor regulator outlet pressure surge recorded (GAL-2199, acknowledged). Verify surge relief valve reseated correctly during the next on-premises walkdown.",
  "Station-6": "Delivery pressure and output flow rate nominal. No on-premises action required; maintain standard telemetry polling interval.",
  "Station-7": "Odorant injection duty cycle irregular (GAL-2200). On-premises technician should verify odorant reservoir level and injection pump calibration before next scheduled delivery.",
  "Station-8": "Station is under construction — telemetry link pending commissioning. On-premises crew must confirm edge-device provisioning before this facility can report live output flow rate or delivery pressure.",
};

/* ============================================================
   ADVISORY PANEL GENERATORS
   Right-side Operations Advisory Panel content, contextualized per
   asset tag. Each item can expand into a nested diagnostic breakdown
   with an [ Assign Task ] action inside the panel.
   ============================================================ */

export function buildWaterAdvisories(asset: Asset): AdvisoryItem[] {
  return [
    {
      id: `${asset.tag}-ADV-1`,
      title: "Pump efficiency drift identified",
      titleAr: "تم رصد انحراف في كفاءة المضخة",
      severity: "warning",
      category: "Maintenance",
      categoryAr: "الصيانة",
      summary: `${asset.tag} hydraulic efficiency has drifted -4.4% below the commissioning baseline over the last 72 hours.`,
      summaryAr: `انحرفت كفاءة ${asset.tag} الهيدروليكية بنسبة -4.4% عن خط الأساس خلال آخر 72 ساعة.`,
      diagnostic: `Efficiency 91.2% (Δ -4.4%) · Seal chamber ΔP +0.3 bar · DE vibration 6.1 mm/s`,
      diagnosticAr: `الكفاءة 91.2% (Δ -4.4%) · فرق ضغط حجرة الحشية +0.3 بار · اهتزاز المحمل 6.1 مم/ث`,
      coordinate: `Valve V-${asset.tag}-04 · Discharge header`,
      history: "3 similar drift events in the last 90 days, each resolved via mechanical seal inspection.",
      historyAr: "3 أحداث انحراف مشابهة خلال آخر 90 يوماً، تم حلها جميعاً عبر فحص الحشية الميكانيكية.",
    },
    {
      id: `${asset.tag}-ADV-2`,
      title: "Pipeline head loss violation warning",
      titleAr: "تحذير مخالفة فقدان الضغط في خط الأنابيب",
      severity: "danger",
      category: "Network Operations",
      categoryAr: "عمليات الشبكة",
      summary: `Trunk main downstream of ${asset.tag} shows head loss exceeding the modeled envelope by 14%.`,
      summaryAr: `يُظهر الخط الرئيسي أسفل ${asset.tag} فقداناً في الضغط يتجاوز النموذج المرجعي بنسبة 14%.`,
      diagnostic: `Modeled head loss 2.1 m · Observed 2.4 m (+14%) · Flow ${asset.flow.toLocaleString()} m³/hr`,
      diagnosticAr: `فقدان الضغط النموذجي 2.1 م · الملحوظ 2.4 م (+14%) · التدفق ${asset.flow.toLocaleString()} م³/ساعة`,
      coordinate: `Trunk main · Node N-${asset.tag}-12`,
      history: "Pipeline segment last pigged 14 months ago; scale buildup suspected.",
      historyAr: "تم تنظيف خط الأنابيب آخر مرة قبل 14 شهراً؛ يُشتبه بتراكم الترسبات.",
    },
    {
      id: `${asset.tag}-ADV-3`,
      title: "Time-of-Use tariff threshold alert",
      titleAr: "تنبيه تجاوز حد تعرفة وقت الاستخدام",
      severity: "info",
      category: "Energy Optimization",
      categoryAr: "تحسين الطاقة",
      summary: `${asset.tag} pumping load is drawing during the 12:00–17:00 peak tariff window.`,
      summaryAr: `يسحب حمل الضخ في ${asset.tag} خلال نافذة تعرفة الذروة 12:00–17:00.`,
      diagnostic: `Peak-window draw 22 min today · Tariff rate AED 0.42/kWh vs AED 0.15/kWh off-peak`,
      diagnosticAr: `سحب نافذة الذروة 22 دقيقة اليوم · تعرفة 0.42 درهم/ك.و.س مقابل 0.15 درهم خارج الذروة`,
      coordinate: `Feeder breaker · BRK-${asset.tag}-02`,
      history: "Recommend shifting reservoir refill cycle to the 22:00–06:00 off-peak window.",
      historyAr: "يوصى بتحويل دورة إعادة تعبئة الخزان إلى نافذة خارج الذروة 22:00–06:00.",
    },
  ];
}

export function buildGasAdvisories(asset: Asset): AdvisoryItem[] {
  return [
    {
      id: `${asset.tag}-ADV-1`,
      title: "Delivery pressure regulator drift",
      titleAr: "انحراف منظم ضغط التسليم",
      severity: "warning",
      category: "Maintenance",
      categoryAr: "الصيانة",
      summary: `${asset.tag} regulator outlet pressure has drifted -0.4 bar below the nominal set point.`,
      summaryAr: `انحرف ضغط مخرج منظم ${asset.tag} بمقدار -0.4 بار عن نقطة الضبط الطبيعية.`,
      diagnostic: `Delivery pressure ${asset.pressure} bar (Δ -0.4) · Regulator response +40 ms`,
      diagnosticAr: `ضغط التسليم ${asset.pressure} بار (Δ -0.4) · زمن استجابة المنظم +40 ملي ثانية`,
      coordinate: `Regulator set · REG-${asset.tag}-01`,
      history: "Diaphragm wear consistent with early-stage degradation; last replaced 18 months ago.",
      historyAr: "تآكل الغشاء يتوافق مع تدهور مبكر؛ تم استبداله آخر مرة قبل 18 شهراً.",
    },
    {
      id: `${asset.tag}-ADV-2`,
      title: "Odorant injection concentration alert",
      titleAr: "تنبيه تركيز حقن الرائحة",
      severity: "danger",
      category: "Compliance",
      categoryAr: "الامتثال",
      summary: `${asset.tag} odorant concentration reads below the 16 mg/m³ regulatory minimum.`,
      summaryAr: `يقرأ تركيز الرائحة في ${asset.tag} أقل من الحد التنظيمي الأدنى البالغ 16 مغ/م³.`,
      diagnostic: `Odorant concentration 12.4 mg/m³ (target 18.0) · Injection pump duty irregular`,
      diagnosticAr: `تركيز الرائحة 12.4 مغ/م³ (الهدف 18.0) · دورة تشغيل مضخة الحقن غير منتظمة`,
      coordinate: `Odorant skid · OD-${asset.tag}-01`,
      history: "Injection pump calibration drift flagged twice in the last quarter.",
      historyAr: "تم رصد انحراف معايرة مضخة الحقن مرتين خلال الربع الأخير.",
    },
    {
      id: `${asset.tag}-ADV-3`,
      title: "Compressor duty-cycle threshold warning",
      titleAr: "تحذير تجاوز حد دورة تشغيل الضاغط",
      severity: "info",
      category: "Operations",
      categoryAr: "العمليات",
      summary: `${asset.tag} compressor duty cycle is trending toward the 85% sustained-load threshold.`,
      summaryAr: `تتجه دورة تشغيل ضاغط ${asset.tag} نحو حد الحمل المستمر البالغ 85%.`,
      diagnostic: `Duty cycle 81% (24h avg) · Output flow rate ${asset.flow.toLocaleString()} m³/hr`,
      diagnosticAr: `دورة التشغيل 81% (متوسط 24 ساعة) · معدل تدفق المخرج ${asset.flow.toLocaleString()} م³/ساعة`,
      coordinate: `Compressor bay · CMP-${asset.tag}-01`,
      history: "Recommend load-balancing against the adjacent facility during peak network demand.",
      historyAr: "يوصى بموازنة الحمل مع المنشأة المجاورة خلال ذروة الطلب على الشبكة.",
    },
  ];
}

// Standard Operating Procedure checklist options offered in the Assign
// Alert Panel's SOP Checklist Selector, per sector.
export const WATER_SOP_OPTIONS = [
  "SOP-WTR-4421 · Distribution Pump Restart",
  "SOP-QA-118 · Analyzer Calibration",
  "SOP-EMG-002 · Emergency Isolation & Bypass",
  "Generic Emergency Response Checklist",
];

export const GAS_SOP_OPTIONS = [
  "SOP-GAS-2210 · Regulator Set Startup",
  "SOP-GAS-118 · Odorant Analyzer Calibration",
  "SOP-EMG-002 · Emergency Isolation & Bypass",
  "Generic Emergency Response Checklist",
];

/* ============================================================
   SECTOR-WIDE AI ADVISORY GENERATORS
   Network-level recommendations (not tied to one asset) so the AI
   Advisory button in the header always has something meaningful to
   show, on any page, in any sector — falling back from the more
   specific per-asset advisories generated on the Asset Detail pages.
   ============================================================ */

export function buildWaterSectorAdvisories(): AdvisoryItem[] {
  const unacked = ALARMS.filter((a) => !a.ack).length;
  return [
    {
      id: "NET-WTR-ADV-1",
      title: "Network-wide Sev-1 alarm backlog",
      titleAr: "تراكم إنذارات الفئة 1 على مستوى الشبكة",
      severity: unacked > 2 ? "danger" : "warning",
      category: "Operations",
      categoryAr: "العمليات",
      summary: `${unacked} Sev-1 alarms remain unacknowledged across the water network in the current shift window.`,
      summaryAr: `لا تزال ${unacked} إنذارات من الفئة 1 غير مؤكدة عبر شبكة المياه خلال نافذة النوبة الحالية.`,
      diagnostic: `Availability ${KPI.availability}% · Total production ${KPI.production.toLocaleString()} m³/hr`,
      diagnosticAr: `التوافر ${KPI.availability}% · إجمالي الإنتاج ${KPI.production.toLocaleString()} م³/ساعة`,
      coordinate: "Network Operations Center · Shift Queue",
      history: "Recommend triaging oldest unacknowledged alarms first per shift handover SOP.",
      historyAr: "يوصى بمعالجة أقدم الإنذارات غير المؤكدة أولاً وفق إجراء تسليم النوبة.",
    },
    {
      id: "NET-WTR-ADV-2",
      title: "Non-Revenue Water trending near threshold",
      titleAr: "المياه غير المُحصَّلة تقترب من الحد الأقصى",
      severity: "warning",
      category: "Network Audit",
      categoryAr: "تدقيق الشبكة",
      summary: "Emirate-wide NRW is holding at 10.4%, close to the 12% governance threshold.",
      summaryAr: "تبلغ نسبة المياه غير المُحصَّلة على مستوى الإمارة 10.4%، قريباً من حد الحوكمة البالغ 12%.",
      diagnostic: "NRW 10.4% · 6 DMAs above alarm threshold · Estimated losses 42,180 m³/d",
      diagnosticAr: "المياه غير المُحصَّلة 10.4% · 6 مناطق قياس فوق حد الإنذار · الفاقد المقدر 42,180 م³/يوم",
      coordinate: "DMA Water Audit · Network-wide",
      history: "3 DMAs flagged for acoustic leak survey in the last audit cycle.",
      historyAr: "تم تحديد 3 مناطق قياس لمسح صوتي للتسريبات في دورة التدقيق الأخيرة.",
    },
    {
      id: "NET-WTR-ADV-3",
      title: "Time-of-Use tariff optimization opportunity",
      titleAr: "فرصة لتحسين تعرفة وقت الاستخدام",
      severity: "info",
      category: "Energy Optimization",
      categoryAr: "تحسين الطاقة",
      summary: "Peak-window pumping load can be shifted further to capture additional off-peak savings.",
      summaryAr: "يمكن تحويل حمل الضخ خلال نافذة الذروة أكثر لتحقيق وفورات إضافية خارج الذروة.",
      diagnostic: "Current SEC 0.548 kWh/m³ · FY26 target 0.55 · ToU compliance 94.2%",
      diagnosticAr: "استهلاك الطاقة النوعي الحالي 0.548 ك.و.س/م³ · هدف 2026 0.55 · امتثال ToU 94.2%",
      coordinate: "Executive Strategy · Energy Optimization",
      history: "Estimated additional savings of AED 3.6M/month achievable with full off-peak shift.",
      historyAr: "يمكن تحقيق وفورات إضافية تقدر بـ 3.6 مليون درهم/شهر عبر التحول الكامل خارج الذروة.",
    },
  ];
}

export function buildGasSectorAdvisories(): AdvisoryItem[] {
  return [
    {
      id: "NET-GAS-ADV-1",
      title: "Network-wide Sev-1 alarm backlog",
      titleAr: "تراكم إنذارات الفئة 1 على مستوى الشبكة",
      severity: GAS_KPI.criticalCount > 0 ? "danger" : "info",
      category: "Operations",
      categoryAr: "العمليات",
      summary: `${GAS_KPI.criticalCount} Sev-1 gas network alarms remain unacknowledged in the current shift window.`,
      summaryAr: `لا تزال ${GAS_KPI.criticalCount} إنذارات من الفئة 1 لشبكة الغاز غير مؤكدة خلال نافذة النوبة الحالية.`,
      diagnostic: `Availability ${GAS_KPI.availability}% · Network pressure stability ${GAS_KPI.networkPressureStability}%`,
      diagnosticAr: `التوافر ${GAS_KPI.availability}% · استقرار ضغط الشبكة ${GAS_KPI.networkPressureStability}%`,
      coordinate: "Gas Network Operations Center · Shift Queue",
      history: "Recommend triaging oldest unacknowledged alarms first per shift handover SOP.",
      historyAr: "يوصى بمعالجة أقدم الإنذارات غير المؤكدة أولاً وفق إجراء تسليم النوبة.",
    },
    {
      id: "NET-GAS-ADV-2",
      title: "Pressure-loss audit trending near threshold",
      titleAr: "تدقيق فقدان الضغط يقترب من الحد الأقصى",
      severity: "warning",
      category: "Network Audit",
      categoryAr: "تدقيق الشبكة",
      summary: "Network-wide pressure loss is holding at 2.9%, with Station-3 flagged for investigation.",
      summaryAr: "يبلغ فقدان الضغط على مستوى الشبكة 2.9%، مع تحديد المحطة-3 للتحقيق.",
      diagnostic: "Network loss 2.9% · 1 facility above alarm threshold · Estimated losses 3,240 m³/d",
      diagnosticAr: "فقدان الشبكة 2.9% · منشأة واحدة فوق حد الإنذار · الفاقد المقدر 3,240 م³/يوم",
      coordinate: "Gas Network Audit Ledger · Network-wide",
      history: "Station-3 East Metering flagged for field crew inspection this cycle.",
      historyAr: "تم تحديد محطة الشرق للقياس-3 لفحص فريق ميداني في هذه الدورة.",
    },
    {
      id: "NET-GAS-ADV-3",
      title: "Odorant compliance fleet-wide check",
      titleAr: "فحص الامتثال لتركيز الرائحة على مستوى الأسطول",
      severity: "info",
      category: "Compliance",
      categoryAr: "الامتثال",
      summary: "Fleet-wide odorant concentration is within target at all facilities except Station-3.",
      summaryAr: "تركيز الرائحة على مستوى الأسطول ضمن الهدف في جميع المنشآت باستثناء المحطة-3.",
      diagnostic: "Target 16–20 mg/m³ · Station-3 reading 12.4 mg/m³ (-31%)",
      diagnosticAr: "الهدف 16–20 مغ/م³ · قراءة المحطة-3 12.4 مغ/م³ (-31%)",
      coordinate: "Gas Quality & Odorization · Network-wide",
      history: "Recommend scheduling odorant injection pump recalibration for Station-3.",
      historyAr: "يوصى بجدولة إعادة معايرة مضخة حقن الرائحة للمحطة-3.",
    },
  ];
}

export function buildElectricSectorAdvisories(): AdvisoryItem[] {
  return [
    {
      id: "NET-ELEC-ADV-1",
      title: "Electrical Power Grid sector commissioning",
      titleAr: "قطاع شبكة الطاقة الكهربائية قيد التشغيل التجريبي",
      severity: "info",
      category: "Commissioning",
      categoryAr: "التشغيل التجريبي",
      summary: "AI advisory coverage for the Electrical Power Grid sector will activate once grid telemetry pages are commissioned.",
      summaryAr: "سيتم تفعيل تغطية الإرشاد الذكي لقطاع شبكة الطاقة الكهربائية بمجرد تشغيل صفحات القياس عن بعد للشبكة.",
      diagnostic: "Sector switcher, theme accent, and layout context are live; telemetry feed pending.",
      diagnosticAr: "مبدّل القطاعات ولون الواجهة والتخطيط جاهزون؛ تغذية القياس عن بعد قيد الانتظار.",
      coordinate: "Electrical Power Grid · Sector-wide",
      history: "No historical telemetry available yet for this sector.",
      historyAr: "لا توجد بيانات قياس عن بعد تاريخية متاحة بعد لهذا القطاع.",
    },
  ];
}
