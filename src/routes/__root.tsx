import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import * as React from "react";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DialogProvider } from "@/components/ui/DialogProvider";
import { OfflineOverlay } from "@/components/OfflineOverlay";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { initSentry } from "../lib/sentry";

// Initialize Sentry for client-side error tracking
if (typeof window !== "undefined") {
  initSentry().catch(console.error);
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return to Editor
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("[Root Error Boundary]:", error);
  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const isSupabaseError = error.message?.includes("Supabase configuration");
  const isHydrationError =
    error.message?.includes("hydration") || error.message?.includes("Hydration");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {isSupabaseError
            ? "Configuration Required"
            : isHydrationError
              ? "Syncing App State"
              : "Something went wrong"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSupabaseError
            ? "Your project is not connected to a backend. Please connect Supabase in the Lovable editor to enable all features."
            : isHydrationError
              ? "The app is synchronizing its internal state. If this takes more than a few seconds, please try a hard refresh."
              : "An unexpected error occurred. Please try refreshing the page."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          {!isSupabaseError && (
            <button
              onClick={() => (window.location.href = "/")}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Reload Editor
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dungeon Scrawl Map Maker - RPG Dungeon Editor" },
      {
        name: "description",
        content:
          "A professional 2D dungeon map maker for RPGs. Design, generate, and export high-quality dungeon maps with AI assistance.",
      },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Dungeon Scrawl Map Maker" },
      {
        property: "og:description",
        content: "Design and generate professional RPG dungeon maps with ease.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased selection:bg-primary/30 selection:text-foreground">
        <TooltipProvider delayDuration={200}>
          <DialogProvider>{children}</DialogProvider>
        </TooltipProvider>
        <Toaster position="top-center" richColors />
        <OfflineOverlay />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // The React 19 dispatcher is initialized by the router's internal Awaited implementation.
  // We ensure the environment is ready before rendering to avoid "dispatcher is null" errors.
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
