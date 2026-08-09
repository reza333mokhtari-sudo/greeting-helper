import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { checkHealth } from "@/lib/health.functions";
import { CheckCircle2, XCircle, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

export function HealthCheckIndicator() {
  const [health, setHealth] = useState<{ status: string; database: boolean; error: string | null } | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [loading, setLoading] = useState(true);
  const runHealthCheck = useServerFn(checkHealth);

  const performCheck = async () => {
    setLoading(true);
    try {
      const result = await runHealthCheck();
      setHealth(result);
      
      const { data: { session } } = await supabase.auth.getSession();
      setAuthStatus(session ? 'authenticated' : 'unauthenticated');
    } catch (err) {
      console.error("Health check failed:", err);
      setHealth({ status: "error", database: false, error: "Connection failed" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performCheck();
    // Re-check every 5 minutes
    const interval = setInterval(performCheck, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={performCheck}
              disabled={loading}
              className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : health?.database ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                DB
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {loading ? "Checking database connectivity..." : 
             health?.database ? "Database connected" : 
             `Database error: ${health?.error || "Unknown"}`}
          </TooltipContent>
        </Tooltip>

        <div className="h-3 w-px bg-border mx-0.5" />

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              {authStatus === 'loading' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : authStatus === 'authenticated' ? (
                <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
              ) : (
                <ShieldAlert className="h-3.5 w-3.5 text-orange-500" />
              )}
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                Auth
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {authStatus === 'loading' ? "Checking auth status..." : 
             authStatus === 'authenticated' ? "Authenticated session active" : 
             "No active session (Guest mode)"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
