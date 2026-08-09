import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

/**
 * Initialize Sentry for the server (Nitro/Vercel Edge).
 * Note: Profiling might not be available in Edge runtimes.
 */
export function initSentryServer() {
  const dsn = process.env['SENTRY_DSN'] || process.env['VITE_SENTRY_DSN'];
  
  if (!dsn) {
    console.log("[Sentry] Skipping server initialization (SENTRY_DSN not set)");
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    environment: process.env['NODE_ENV'],
  });

  console.log("[Sentry] Server SDK initialized");
}
