/**
 * Initialize Sentry for the browser.
 * This is called in the entry point of the application.
 */
export async function initSentry() {
  if (typeof window === "undefined") return;

  const dsn = import.meta.env['VITE_SENTRY_DSN'];
  if (!dsn) {
    console.log("[Sentry] Skipping browser initialization (VITE_SENTRY_DSN not set)");
    return;
  }

  try {
    const Sentry = await import("@sentry/react");
    Sentry.init({
      dsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env.MODE,
    });
    console.log("[Sentry] Browser SDK initialized");
  } catch (err) {
    console.error("Failed to initialize Sentry:", err);
  }
}

export async function captureClientException(error: unknown, context?: any) {
  if (typeof window === "undefined") return;
  try {
    const Sentry = await import("@sentry/react");
    Sentry.captureException(error, context);
  } catch (err) {
    console.error("Failed to capture exception:", err, error);
  }
}
