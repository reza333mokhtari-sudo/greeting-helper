import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
export const checkHealth = createServerFn({ method: "GET" })
    .handler(async () => {
    try {
        // Basic connectivity check: try to fetch something trivial or just check session
        // Since this is a health check, we just want to see if the client can reach the backend.
        const { data, error } = await supabase.from('user_roles').select('id').limit(1);
        return {
            status: error ? "error" : "healthy",
            database: !error,
            timestamp: new Date().toISOString(),
            error: error?.message || null
        };
    }
    catch (err) {
        return {
            status: "error",
            database: false,
            timestamp: new Date().toISOString(),
            error: err.message
        };
    }
});
