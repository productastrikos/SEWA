// Hand-rolled SVG line-art icon shim. Brand rule: no lucide/heroicons/fontawesome.
// All icons: viewBox 0 0 24 24, stroke="currentColor", fill="none", stroke-width 1.7.
// Exposed under lucide-react names (via vite alias) so existing imports keep working.
import type { SVGProps, ReactNode } from "react";

type Props = SVGProps<SVGSVGElement> & { size?: number | string };

function Ico({ children, className = "", size, ...rest }: Props & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size ?? undefined}
      height={size ?? undefined}
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

const make = (paths: ReactNode) => (p: Props) => <Ico {...p}>{paths}</Ico>;

/* Geometry / status */
export const Activity = make(<polyline points="3 12 7 12 10 4 14 20 17 12 21 12" />);
export const AlertTriangle = make(
  <>
    <path d="M12 3.5 2.8 19.5h18.4L12 3.5Z" />
    <path d="M12 10v5" />
    <circle cx="12" cy="18" r="0.6" fill="currentColor" />
  </>,
);
export const ArrowLeft = make(
  <>
    <path d="M20 12H4" />
    <path d="M10 6l-6 6 6 6" />
  </>,
);
export const ArrowRight = make(
  <>
    <path d="M4 12h16" />
    <path d="M14 6l6 6-6 6" />
  </>,
);
export const ArrowUpRight = make(
  <>
    <path d="M6 18 18 6" />
    <path d="M9 6h9v9" />
  </>,
);
export const Bot = make(
  <>
    <rect x="4" y="8" width="16" height="12" rx="3" />
    <path d="M12 4v4" />
    <circle cx="9" cy="14" r="1" fill="currentColor" />
    <circle cx="15" cy="14" r="1" fill="currentColor" />
  </>,
);
export const Boxes = make(
  <>
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="8" y="13" width="8" height="8" rx="1" />
  </>,
);
export const Check = make(<polyline points="4 12 10 18 20 6" />);
export const ChevronDown = make(<polyline points="6 9 12 15 18 9" />);
export const ChevronDownIcon = ChevronDown;
export const ChevronLeft = make(<polyline points="15 6 9 12 15 18" />);
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRight = make(<polyline points="9 6 15 12 9 18" />);
export const ChevronRightIcon = ChevronRight;
export const ChevronUp = make(<polyline points="6 15 12 9 18 15" />);
export const Circle = make(<circle cx="12" cy="12" r="9" />);
export const Clock = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 16 14" />
  </>,
);
export const Cloud = make(<path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6 11a4 4 0 0 0 1 7Z" />);
export const Database = make(
  <>
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
    <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
  </>,
);
export const DollarSign = make(
  <>
    <path d="M12 3v18" />
    <path d="M17 7H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H6" />
  </>,
);
export const ScanEye = make(
  <>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M5.5 12C7 9 9.3 7.5 12 7.5S17 9 18.5 12C17 15 14.7 16.5 12 16.5S7 15 5.5 12Z" />
  </>,
);
export const Droplets = make(
  <>
    <path d="M12 3s5 5.5 5 9.5a5 5 0 0 1-10 0C7 8.5 12 3 12 3Z" />
    <path d="M6 21c1.5-1.5 3-1.5 4.5 0" />
  </>,
);
export const Flame = make(
  <path d="M12 3s3.5 3.5 3.5 7a3.5 3.5 0 0 1-7 0c0-1.2.6-2 1-2.7C10 9 8 11 8 14a4 4 0 0 0 8 0c0-4.5-4-6-4-11Z" />,
);
export const FlaskConical = make(
  <>
    <path d="M9 3h6" />
    <path d="M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" />
    <path d="M7.5 14h9" />
  </>,
);
export const Gauge = make(
  <>
    <path d="M12 14 8 8" />
    <circle cx="12" cy="14" r="0.8" fill="currentColor" />
    <path d="M4 16a8 8 0 1 1 16 0" />
  </>,
);
export const Globe = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c3 3.5 3 14.5 0 18" />
    <path d="M12 3c-3 3.5-3 14.5 0 18" />
  </>,
);
export const GripVertical = make(
  <>
    <circle cx="9" cy="6" r="0.8" fill="currentColor" />
    <circle cx="15" cy="6" r="0.8" fill="currentColor" />
    <circle cx="9" cy="12" r="0.8" fill="currentColor" />
    <circle cx="15" cy="12" r="0.8" fill="currentColor" />
    <circle cx="9" cy="18" r="0.8" fill="currentColor" />
    <circle cx="15" cy="18" r="0.8" fill="currentColor" />
  </>,
);
export const LayoutGrid = make(
  <>
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
  </>,
);
export const Leaf = make(<path d="M4 20c0-9 7-16 16-16 0 9-7 16-16 16Zm0 0 8-8" />);
export const Loader2 = make(<path d="M12 3a9 9 0 1 1-6.36 2.64" />);
export const Lock = make(
  <>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 1 1 8 0v3" />
  </>,
);
export const LogOut = make(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 4-5-4-5" />
    <path d="M20 12H9" />
  </>,
);
export const MapPin = make(
  <>
    <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </>,
);
export const MessageSquare = make(<path d="M4 5h16v11H8l-4 4V5Z" />);
export const Minus = make(<path d="M5 12h14" />);
export const MoreHorizontal = make(
  <>
    <circle cx="6" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="18" cy="12" r="1" fill="currentColor" />
  </>,
);
export const PanelLeft = make(
  <>
    <rect x="3" y="4" width="18" height="16" rx="1.5" />
    <path d="M9 4v16" />
  </>,
);
export const Play = make(<path d="M7 4v16l13-8L7 4Z" />);
export const Power = make(
  <>
    <path d="M12 3v9" />
    <path d="M6.4 6.4a8 8 0 1 0 11.2 0" />
  </>,
);
export const Search = make(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.4-4.4" />
  </>,
);
export const Send = make(
  <>
    <path d="M4 20 20 12 4 4l3 8-3 8Z" />
    <path d="M7 12h13" />
  </>,
);
export const Shield = make(<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />);
export const ShieldCheck = make(
  <>
    <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
    <polyline points="9 12 11 14 15 10" />
  </>,
);
export const Sparkles = make(
  <>
    <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
    <path d="M6.5 6.5 8 8M16 16l1.5 1.5M6.5 17.5 8 16M16 8l1.5-1.5" />
  </>,
);
export const TrendingDown = make(
  <>
    <polyline points="3 7 10 14 14 10 21 17" />
    <polyline points="21 12 21 17 16 17" />
  </>,
);
export const TrendingUp = make(
  <>
    <polyline points="3 17 10 10 14 14 21 7" />
    <polyline points="21 12 21 7 16 7" />
  </>,
);
export const User = make(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
  </>,
);
export const UserIcon = User;
export const Waves = make(
  <>
    <path d="M3 8c2 0 2 2 4.5 2S10 8 12 8s2 2 4.5 2S19 8 21 8" />
    <path d="M3 14c2 0 2 2 4.5 2s2.5-2 4.5-2 2 2 4.5 2 2.5-2 4.5-2" />
  </>,
);
export const Wifi = make(
  <>
    <path d="M2 9a15 15 0 0 1 20 0" />
    <path d="M5 12.5a10 10 0 0 1 14 0" />
    <path d="M8.5 16a5 5 0 0 1 7 0" />
    <circle cx="12" cy="19" r="0.8" fill="currentColor" />
  </>,
);
export const Wrench = make(
  <path d="M14 4a5 5 0 0 1 6 6l-2 2-4-4 2-2a5 5 0 0 0-6-2l4 4-8 8a2.8 2.8 0 1 1-4-4l8-8Z" />,
);
export const X = make(
  <>
    <path d="m6 6 12 12" />
    <path d="m18 6-12 12" />
  </>,
);
export const Zap = make(<path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />);
