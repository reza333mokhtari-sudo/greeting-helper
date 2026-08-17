import { createServerFn } from "@tanstack/react-start";

export const checkHealth = createServerFn({ method: "GET" }).handler(async () => {
  try {
    // In SSR/Worker environments, we must use the service role client or a specifically configured server client
    // to avoid issues with browser-only storage or missing env vars at module scope.
    let supabaseAdmin;
    try {
      const admin = await import("@/integrations/supabase/client.server");
      supabaseAdmin = admin.supabaseAdmin;
    } catch (e) {
      return {
        status: "error",
        database: false,
        timestamp: new Date().toISOString(),
        error: "Supabase server client initialization failed. Check environment variables.",
      };
    }

    const { data, error } = await supabaseAdmin.from("user_roles").select("id").limit(1);

    return {
      status: error ? "error" : "healthy",
      database: !error,
      timestamp: new Date().toISOString(),
      error: error?.message || null,
    };
  } catch (err: any) {
    console.error("[HealthCheck] Failed:", err);
    return {
      status: "error",
      database: false,
      timestamp: new Date().toISOString(),
      error: err.message || "Unknown error occurred",
    };
  }
});
