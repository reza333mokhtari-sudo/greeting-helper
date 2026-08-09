import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for the browser.
 * This is called in the entry point of the application.
 */
export function initSentry() {
  if (typeof window === "undefined") return;

  // We only initialize if a DSN is provided via env
  const dsn = import.meta.env['VITE_SENTRY_DSN'];
  if (!dsn) {
    console.log("[Sentry] Skipping browser initialization (VITE_SENTRY_DSN not set)");
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, 
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });
  
  console.log("[Sentry] Browser SDK initialized");
}
