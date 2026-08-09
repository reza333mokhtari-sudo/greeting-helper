/**
 * Initialize Sentry for the server (Nitro/Vercel Edge).
 */
export async function initSentryServer() {
  const dsn = process.env['SENTRY_DSN'] || process.env['VITE_SENTRY_DSN'];
  
  if (!dsn) {
    console.log("[Sentry] Skipping server initialization (SENTRY_DSN not set)");
    return;
  }

  try {
    const Sentry = await import("@sentry/node");
    Sentry.init({
      dsn,
      tracesSampleRate: 1.0,
      environment: process.env['NODE_ENV'],
    });
    console.log("[Sentry] Server SDK initialized");
  } catch (err) {
    console.error("Failed to initialize Sentry Server:", err);
  }
}

export async function captureServerException(error: unknown) {
  try {
    const Sentry = await import("@sentry/node");
    Sentry.captureException(error);
  } catch (err) {
    console.error("Failed to capture server exception:", err, error);
  }
}
