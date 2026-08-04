import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Search = { next?: string | undefined };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({ next: typeof s["next"] === "string" ? (s["next"] as string) : undefined }),
  head: () => ({
    meta: [
      { title: "Sign in — Dungeon Scrawl Map Maker" },
      { name: "description", content: "Sign in to save your dungeon maps to the cloud, upload props and share player-ready links." },
      { property: "og:title", content: "Sign in — Dungeon Scrawl Map Maker" },
      { property: "og:description", content: "Save maps to the cloud, upload textures and share player links." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function AuthPage() {
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth" });
  const dest = safeNext(next);
  const [tab, setTab] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: dest, replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: dest, replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [dest, navigate]);

  /** Shared guard so both flows fail with a readable message instead of a raw API error. */
  const invalid = () => {
    if (!email.trim() || !email.includes("@")) return "Enter a valid email address";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const signIn = async () => {
    const bad = invalid();
    if (bad) {
      toast.error(bad);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      const m = error.message.toLowerCase();
      toast.error(
        m.includes("not confirmed")
          ? "Your email isn't confirmed yet — check your inbox or resend the link."
          : m.includes("invalid login")
            ? "Wrong email or password."
            : error.message,
      );
      return;
    }
    toast.success("Welcome back!");
  };

  const signUp = async () => {
    const bad = invalid();
    if (bad) {
      toast.error(bad);
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin, data: { display_name: name.trim() || email.split("@")[0] } },
    });
    setBusy(false);
    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("already registered") || m.includes("already been registered")) {
        toast.error("That email already has an account — sign in instead.");
        setTab("in");
        return;
      }
      toast.error(error.message);
      return;
    }
    if (!data.session) toast.success("Check your email to confirm your account.");
  };

  /** Send a password-reset email pointing at the /reset-password page. */
  const forgot = async () => {
    if (!email.trim()) {
      toast.error("Enter your email address first");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent — check your inbox.");
  };

  /** Re-send the account activation email. */
  const resendActivation = async () => {
    if (!email.trim()) {
      toast.error("Enter your email address first");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Activation email sent again.");
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${dest}`,
    });
    if (result.error) toast.error("Google sign-in failed");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card/70 p-6 shadow-lg backdrop-blur">
        <h1 className="mb-1 text-xl font-semibold text-arcane">Dungeon Scrawl</h1>
        <p className="mb-5 text-xs text-muted-foreground">Sign in to save maps to the cloud and share them.</p>

        <Button variant="outline" className="mb-4 w-full" onClick={google}>
          Continue with Google
        </Button>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "in" | "up")}>
          <TabsList className="mb-3 w-full">
            <TabsTrigger className="flex-1" value="in">
              Sign in
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="up">
              Create account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in">
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void signIn();
              }}
            >
              <Field label="Email" value={email} set={setEmail} type="email" autoComplete="email" />
              <Field label="Password" value={password} set={setPassword} type="password" autoComplete="current-password" />
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
              <div className="flex justify-between text-[11px]">
                <button type="button" className="text-muted-foreground underline hover:text-foreground" onClick={forgot}>
                  Forgot password?
                </button>
                <button type="button" className="text-muted-foreground underline hover:text-foreground" onClick={resendActivation}>
                  Resend activation email
                </button>
              </div>
              <p className="pt-1 text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button type="button" className="font-medium text-primary underline-offset-2 hover:underline" onClick={() => setTab("up")}>
                  Create one
                </button>
              </p>
            </form>
          </TabsContent>

          <TabsContent value="up">
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void signUp();
              }}
            >
              <Field label="Display name" value={name} set={setName} autoComplete="nickname" />
              <Field label="Email" value={email} set={setEmail} type="email" autoComplete="email" />
              <Field label="Password" value={password} set={setPassword} type="password" autoComplete="new-password" />
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Creating…" : "Create account"}
              </Button>
              <p className="text-[11px] text-muted-foreground">
                We&apos;ll email you an activation link. You can keep drawing maps without an account — sign in only to save to the cloud.
              </p>
              <p className="pt-1 text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <button type="button" className="font-medium text-primary underline-offset-2 hover:underline" onClick={() => setTab("in")}>
                  Sign in
                </button>
              </p>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          <button type="button" className="underline hover:text-foreground" onClick={() => navigate({ to: "/" })}>
            Continue as guest
          </button>
        </p>
      </div>
    </main>
  );
}

function Field(p: { label: string; value: string; set: (v: string) => void; type?: string; autoComplete?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{p.label}</Label>
      <Input
        type={p.type ?? "text"}
        value={p.value}
        autoComplete={p.autoComplete ?? "off"}
        onChange={(e) => p.set(e.target.value)}
      />
    </div>
  );
}

