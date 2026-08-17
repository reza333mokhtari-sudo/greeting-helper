import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { checkAdminAccess } from "./admin.functions";

/**
 * Fetches aggregate statistics for the admin dashboard.
 */
export const getAdminStats = createServerFn({ method: "GET" }).handler(async () => {
  await checkAdminAccess();

  const [
    { count: profilesCount },
    { count: mapsCount },
    { count: assetsCount },
    { data: recentAudit },
  ] = await Promise.all([
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("maps").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("map_assets").select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  // Aggregate audit actions for visualization
  const auditStats = (recentAudit || []).reduce((acc: Record<string, number>, log: any) => {
    const action = String(log.action || "UNKNOWN");
    acc[action] = (acc[action] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(auditStats).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  return {
    stats: [
      { label: "Total Users", value: profilesCount || 0, trend: "+12%" },
      { label: "Total Maps", value: mapsCount || 0, trend: "+5%" },
      { label: "Asset Library", value: assetsCount || 0, trend: "+8%" },
    ],
    chartData,
    recentAudit: (recentAudit || []).map((log) => ({
      id: String(log.id),
      action: String(log.action),
      table_name: String(log.table_name || ""),
      created_at: String(log.created_at),
    })),
  };
});
