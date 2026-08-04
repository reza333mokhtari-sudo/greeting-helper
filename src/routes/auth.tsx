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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: dest });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: dest });
    });
    return () => sub.subscription.unsubscribe();
  }, [dest, navigate]);

  const signIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
  };

  const signUp = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { display_name: name } },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) toast.success("Check your email to confirm your account.");
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

        <Tabs defaultValue="in">
          <TabsList className="mb-3 w-full">
            <TabsTrigger className="flex-1" value="in">
              Sign in
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="up">
              Create account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in" className="space-y-3">
            <Field label="Email" value={email} set={setEmail} type="email" />
            <Field label="Password" value={password} set={setPassword} type="password" />
            <Button className="w-full" disabled={busy} onClick={signIn}>
              Sign in
            </Button>
          </TabsContent>

          <TabsContent value="up" className="space-y-3">
            <Field label="Display name" value={name} set={setName} />
            <Field label="Email" value={email} set={setEmail} type="email" />
            <Field label="Password" value={password} set={setPassword} type="password" />
            <Button className="w-full" disabled={busy} onClick={signUp}>
              Create account
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function Field(p: { label: string; value: string; set: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{p.label}</Label>
      <Input type={p.type ?? "text"} value={p.value} onChange={(e) => p.set(e.target.value)} />
    </div>
  );
}
