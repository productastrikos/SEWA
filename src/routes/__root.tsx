import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppProvider } from "@/lib/app-context";
import { AppShell } from "@/components/AppShell";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="panel-accent p-8 max-w-md text-center">
        <h1 className="text-lg font-semibold">Console interrupted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A subsystem raised an unhandled fault. Reload to resume telemetry.
        </p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground text-sm"
        >
          Reload console
        </button>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="text-center">
        <div className="text-6xl font-mono text-accent">404</div>
        <div className="mt-2 text-sm text-muted-foreground">Console page not registered</div>
        <a
          href="/"
          className="mt-4 inline-block px-4 py-2 rounded bg-primary text-primary-foreground text-sm"
        >
          Return to hub
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Project WAVE — SEWA Operations Console" },
      {
        name: "description",
        content:
          "SEWA (Sharjah Electricity, Water & Gas Authority) unified water operations, telemetry, and hydraulic digital-twin console.",
      },
      { name: "author", content: "SEWA · Project WAVE" },
      { property: "og:title", content: "Project WAVE — SEWA Operations Console" },
      {
        property: "og:description",
        content:
          "Unified water operations, telemetry, digital-twin simulation, and governance for Sharjah's critical water network.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body data-theme="dark">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppShell>
          <Outlet />
        </AppShell>
        <Toaster theme="dark" position="top-right" richColors />
      </AppProvider>
    </QueryClientProvider>
  );
}
