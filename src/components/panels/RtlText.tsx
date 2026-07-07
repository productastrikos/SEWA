import { createElement, type ElementType, type ReactNode } from "react";
import { useApp } from "@/lib/app-context";

// Applies dir="rtl" + text-right strictly to the text node it wraps when
// Arabic is active — never to the panel's structural containers. This is
// how paragraph/header/description text flows correctly RTL inside the
// Advisory and Assign Alert panels while the panels themselves stay
// pinned to a fixed LTR layout.
export function RtlText({
  as = "div",
  className = "",
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const { lang } = useApp();
  const rtl = lang === "ar";
  return createElement(
    as,
    { dir: rtl ? "rtl" : "ltr", className: rtl ? `${className} text-right`.trim() : className },
    children,
  );
}
