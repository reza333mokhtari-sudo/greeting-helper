import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password — Dungeon Scrawl Map Maker" },
      {
        name: "description",
        content: "Choose a new password for your Dungeon Scrawl map maker account.",
      },
      { property: "og:title", content: "Reset password — Dungeon Scrawl Map Maker" },
      { property: "og:description", content: "Choose a new password for your map maker account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Supabase delivers a recovery session via the URL hash before redirecting here.
    const isRecovery = window.location.hash.includes("type=recovery");
    supabase.auth.getSession().then(({ data }: any) => setReady(isRecovery || !!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event: any) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card/70 p-6 shadow-lg backdrop-blur">
        <h1 className="mb-1 text-xl font-semibold text-arcane">Choose a new password</h1>
        <p className="mb-5 text-xs text-muted-foreground">
          {ready
            ? "Enter a new password for your account."
            : "Open the reset link from your email to continue."}
        </p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">New password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!ready}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Confirm password</Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={!ready}
            />
          </div>
          <Button className="w-full" disabled={!ready || busy} onClick={submit}>
            Update password
          </Button>
        </div>
      </div>
    </main>
  );
}
