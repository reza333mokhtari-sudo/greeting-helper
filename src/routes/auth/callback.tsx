import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mapAuthError, MappedError } from '@/lib/auth-errors';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackComponent,
});

function AuthCallbackComponent() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<MappedError | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Check for errors in the URL itself (sent by Supabase)
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      const errorMsg = params.get('error_description') || hashParams.get('error_description');
      const errorCode = params.get('error') || hashParams.get('error');

      if (errorCode || errorMsg) {
        setStatus('error');
        setError(mapAuthError({ message: errorMsg, code: errorCode }));
        return;
      }

      // 2. Exchange code for session (usually automatic if detectSessionInUrl is true, 
      // but we verify to be sure)
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (!session) {
          // No session - could be redirect URL mismatch or site URL issue
          setStatus('error');
          setError({
            en: "Session could not be established. Check Redirect URL and Site URL in Supabase dashboard.",
            fa: "نشست ساخته نشد. Redirect URL و Site URL را در Supabase بررسی کنید",
            technical: "No session found after callback."
          });
          return;
        }

        // Success
        setStatus('success');
        setTimeout(() => {
          navigate({ to: '/' });
        }, 2000);

      } catch (err: any) {
        setStatus('error');
        setError(mapAuthError(err));
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <div className="max-w-md w-full bg-card border rounded-xl p-8 shadow-2xl text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h1 className="text-xl font-bold">Verifying your session...</h1>
            <p className="text-sm text-muted-foreground">Please wait while we secure your connection.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
            <h1 className="text-xl font-bold">Authenticated Successfully!</h1>
            <p className="text-sm text-muted-foreground">Redirecting you to the dungeon editor...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <h1 className="text-xl font-bold text-destructive">Authentication Failed</h1>
            
            <div className="space-y-2 py-2">
              <p className="font-bold text-lg">{error?.fa}</p>
              <p className="text-sm text-muted-foreground italic">{error?.en}</p>
              
              {error?.technical && (
                <div className="mt-4 text-left">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Recovery Steps:</p>
                  <pre className="text-[10px] bg-muted p-2 rounded overflow-auto whitespace-pre-wrap font-mono">
                    {error.technical}
                  </pre>
                </div>
              )}
            </div>

            <Button 
              className="w-full mt-4" 
              variant="outline"
              onClick={() => navigate({ to: '/' })}
            >
              Back to Home
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
