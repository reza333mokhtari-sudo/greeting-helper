import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Mail, Lock } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
};

export function AuthDialog({ open, onOpenChange, reason }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      setSent(true);
      toast.success("Magic link sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send magic link");
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

        {!sent ? (
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
                  className="pl-10"
                  required
                />
              </div>
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
