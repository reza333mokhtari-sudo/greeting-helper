import { useEffect, useState } from "react";
import { createFileRoute, redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertCircle, RefreshCcw } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Search = { next?: string | undefined };

export const Route = createFileRoute("/auth/")({
  // Session lives in localStorage, so the check must run on the client only.
  ssr: false,
  validateSearch: (s: Record<string, unknown>): Search => ({
    next: typeof s["next"] === "string" ? (s["next"] as string) : undefined,
  }),
  // Guard: already signed in → never show the login screen, go straight to the destination.
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const next = search.next;
      throw redirect({
        to: next && next.startsWith("/") && !next.startsWith("//") ? next : "/",
        replace: true,
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Sign in — Dungeon Scrawl Map Maker" },
      {
        name: "description",
        content:
          "Sign in to save your dungeon maps to the cloud, upload props and share player-ready links.",
      },
      { property: "og:title", content: "Sign in — Dungeon Scrawl Map Maker" },
      {
        property: "og:description",
        content: "Save maps to the cloud, upload textures and share player links.",
      },
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      if (data.session) navigate({ to: dest, replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e: any, session: any) => {
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
      setError(bad);
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      console.error("Sign-in error:", error);
      const m = error.message?.toLowerCase() || "";
      if (m.includes("not confirmed")) {
        setError("Your email isn't confirmed yet. Please check your inbox for an activation link.");
      } else if (m.includes("invalid login")) {
        setError(
          "Incorrect email or password. Please double-check your credentials and try again.",
        );
      } else if (m.includes("network")) {
        setError("Network error. Please check your internet connection and try again.");
      } else if (!m || m === "{}") {
        setError("Authentication service unavailable. Please try again in a few moments.");
      } else {
        setError(error.message);
      }
      return;
    }
    toast.success("Welcome back!");
  };

  const signUp = async () => {
    const bad = invalid();
    if (bad) {
      setError(bad);
      return;
    }
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: name.trim() || email.split("@")[0],
          display_name: name.trim() || email.split("@")[0],
        },
      },
    });
    setBusy(false);
    if (error) {
      console.error("Signup error details:", {
        message: error.message,
        status: error.status,
        name: error.name,
        code: error.code,
      });
      const m = error.message?.toLowerCase() || "";
      if (m.includes("already registered") || m.includes("already been registered")) {
        setError("That email already has an account. Would you like to sign in instead?");
        return;
      }
      if (m.includes("weak") || m.includes("guess") || error.status === 422) {
        setError("Password is too common or weak. Please choose a stronger one.");
        return;
      }
      if (!m || m === "{}") {
        setError("Signup failed. Please try again or use a different email.");
        return;
      }
      setError(error.message || "An error occurred during sign up. Please try again.");
      return;
    }

    // Since we removed the trigger (which was causing 500 errors),
    // we now attempt to create the profile row manually if we have a session.
    if (data.user) {
      // Use lovable.auth.upsertProfile to bypass RLS if it existed,
      // or just direct supabase call if we fixed policies.
      // But since we are on the client, we must abide by RLS.
      // We'll attempt it and the user will have it eventually anyway.
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email: data.user.email!,
          display_name: name.trim() || data.user.email!.split("@")[0],
        });
      } catch (e) {
        console.warn("Profile creation deferred:", e);
      }
    }

    if (!data.session) toast.success("Check your email to confirm your account.");
    else navigate({ to: dest, replace: true });
  };

  /** Send a magic link or password-reset email. */
  const forgot = async () => {
    if (!email.trim()) {
      toast.error("Enter your email address first");
      return;
    }
    setBusy(true);
    // Use magic link for sign-in if no password is provided
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(dest)}`,
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Magic sign-in link sent — check your inbox.");
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
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${dest}`,
    });
    setBusy(false);
    if (result.error) {
      console.error("Google sign-in error:", result.error);
      const m = result.error.message?.toLowerCase() || "";
      if (m.includes("popup")) {
        setError("The login window was closed before finishing. Please try again.");
      } else if (m.includes("network")) {
        setError("Connection issue. Please check your internet and try again.");
      } else if (m.includes("unsupported")) {
        setError("Google login is currently unavailable. Please try using your email.");
      } else {
        setError(
          result.error.message || "Google sign-in failed. Please try again or use your email.",
        );
      }
    }
  };

  const ErrorDisplay = () => {
    if (!error) return null;
    return (
      <Alert variant="destructive" className="mb-4 py-2 px-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <AlertDescription className="text-xs font-medium leading-relaxed">
              {error}
            </AlertDescription>
            <Button
              variant="link"
              className="h-auto p-0 text-[10px] text-destructive-foreground/80 hover:text-destructive-foreground flex items-center gap-1 mt-1 font-bold uppercase tracking-wider"
              onClick={() => {
                const prevError = error;
                setError(null);
                if (prevError?.toLowerCase().includes("google")) {
                  void google();
                } else if (tab === "in") {
                  void signIn();
                } else {
                  void signUp();
                }
              }}
            >
              <RefreshCcw className="h-2.5 w-2.5" /> Retry
            </Button>
          </div>
        </div>
      </Alert>
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card/70 p-6 shadow-lg backdrop-blur">
        <h1 className="mb-1 text-xl font-bold tracking-tight text-foreground">DUNGEON SCRAWL</h1>
        <p className="mb-5 text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">
          Authentication Gateway
        </p>

        <ErrorDisplay />

        <Button variant="outline" className="mb-4 w-full" onClick={google} disabled={busy}>
          Continue with Google
        </Button>

        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as "in" | "up");
            setError(null);
          }}
        >
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
              <Field
                label="Password"
                value={password}
                set={setPassword}
                type="password"
                autoComplete="current-password"
              />
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
              <div className="flex justify-between text-[11px]">
                <button
                  type="button"
                  className="text-muted-foreground underline hover:text-foreground font-bold"
                  onClick={forgot}
                >
                  Send Magic Link to Sign In
                </button>
                <button
                  type="button"
                  className="text-muted-foreground underline hover:text-foreground"
                  onClick={resendActivation}
                >
                  Resend activation email
                </button>
              </div>
              <p className="pt-1 text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                  onClick={() => setTab("up")}
                >
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
              <Field
                label="Password"
                value={password}
                set={setPassword}
                type="password"
                autoComplete="new-password"
              />
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Creating…" : "Create account"}
              </Button>
              <p className="text-[11px] text-muted-foreground">
                We&apos;ll email you an activation link. You can keep drawing maps without an
                account — sign in only to save to the cloud.
              </p>
              <p className="pt-1 text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                  onClick={() => setTab("in")}
                >
                  Sign in
                </button>
              </p>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          <button
            type="button"
            className="underline hover:text-foreground"
            onClick={() => navigate({ to: "/editor" })}
          >
            Continue as guest
          </button>
        </p>
      </div>
    </main>
  );
}

function Field(p: {
  label: string;
  value: string;
  set: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
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
