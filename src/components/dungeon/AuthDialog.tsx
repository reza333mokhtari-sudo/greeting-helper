import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Mail, Lock, AlertCircle } from "lucide-react";
import { mapAuthError, MappedError } from "@/lib/auth-errors";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
};

export function AuthDialog({ open, onOpenChange, reason }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<MappedError | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (!url || !key) {
        setConfigError("Supabase is not configured on this deployment. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel, then redeploy.");
      } else {
        setConfigError(null);
      }
    }
  }, [open]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (configError) return;

    setLoading(true);
    setError(null);
    
    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `https://greeting-helper.vercel.app/auth/callback`,
        },
      });

      if (signInError) throw signInError;
      
      setSent(true);
      toast.success("Magic link sent to your email!");
    } catch (err: any) {
      const mapped = mapAuthError(err);
      setError(mapped);
      toast.error(mapped.fa);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <DialogTitle className="text-xl font-bold">Unlock Pro Features</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {reason || "Sign in to access AI assistants, cloud storage, and premium props."}
          </DialogDescription>
        </DialogHeader>

        {configError ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center text-destructive">
            <AlertCircle className="h-10 w-10" />
            <p className="text-sm font-medium">{configError}</p>
          </div>
        ) : !sent ? (
          <form onSubmit={handleLogin} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 ${error ? 'border-destructive ring-destructive' : ''}`}
                  required
                />
              </div>
              {error && (
                <div className="mt-2 flex flex-col gap-1 text-xs text-destructive">
                  <span className="font-bold flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {error.fa}
                  </span>
                  <span className="opacity-70">{error.en}</span>
                  {error.technical && (
                    <span className="mt-1 font-mono text-[9px] opacity-50 bg-destructive/5 p-1 rounded">
                      Details: {error.technical}
                    </span>
                  )}
                </div>
              )}
            </div>
            <Button type="submit" className="w-full shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              Send Magic Link
            </Button>
          </form>
        ) : (
          <div className="py-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium">Check your email</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent a magic link to <strong>{email}</strong>.<br />
              Click the link to sign in instantly.
            </p>
            <Button variant="ghost" className="mt-6 text-xs" onClick={() => setSent(false)}>
              Try a different email
            </Button>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:justify-center sm:space-x-0">
          <div className="text-center text-[10px] text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
