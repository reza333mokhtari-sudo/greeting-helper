import { createStart, createMiddleware, createCsrfMiddleware } from "@tanstack/react-start";
import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { initSentryServer, captureServerException } from "./lib/sentry.server";

// Nitro will await the top-level-await during start.
await initSentryServer();

/**
 * Global error handler for server-side exceptions.
 * Returns a clean HTML error page to prevent leaked stack traces
 * and ensure the browser can recover.
 */
const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    // If it's a planned TanStack redirect or response, re-throw it
    if (error != null && typeof error === "object" && ("statusCode" in error || "status" in error)) {
      throw error;
    }
    
    console.error("[Start] Server Runtime Error:", error);
    captureServerException(error);
    
    // Return a structured error response that the client can handle
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { 
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store" 
      },
    });
  }
});

/**
 * CSRF protection for server functions.
 * Only applies to mutation-like handlers to prevent side-effect attacks.
 */
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
  cookie: {
    name: "x-csrf-token",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  },
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
