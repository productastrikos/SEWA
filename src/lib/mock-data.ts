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
