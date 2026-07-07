import { type ReactNode } from "react";
import { X } from "@/lib/icons";

// Shared right-edge slide-in shell for the Advisory and Assign Alert panels.
// Structural container is pinned to `right: 0` with an explicit `dir="ltr"`
// so it always slides in from the physical right edge of the viewport in
// both English and Arabic — per the no-layout-mirroring rule, only text
// content inside flips direction, never the panel's position or chrome.
export function SlidePanel({
  open,
  onClose,
  title,
  width = 420,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  width?: number;
  children: ReactNode;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.45)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
        aria-hidden={!open}
      />
      <div
        dir="ltr"
        className="fixed top-0 bottom-0 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out"
        style={{
          right: 0,
          height: "100vh",
          width: `min(${width}px, 100vw)`,
          background: "var(--ds-panel)",
          borderLeft: "1px solid var(--ds-border)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          pointerEvents: open ? "auto" : "none",
        }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div
          className="flex items-start justify-between gap-3 px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--ds-border-soft)" }}
        >
          <div className="text-[13px] font-semibold min-w-0" style={{ color: "var(--ds-text)" }}>
            {title}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition shrink-0"
            style={{ color: "var(--ds-text-faint)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
