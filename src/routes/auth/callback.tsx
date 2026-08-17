import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth/callback" }) as any;

  useEffect(() => {
    supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === "SIGNED_IN" && session) {
        const next = search.next || "/editor";
        navigate({ to: next, replace: true });
      } else if (event === "SIGNED_OUT") {
        navigate({ to: "/auth", replace: true });
      }
    });
  }, [navigate, search.next]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
