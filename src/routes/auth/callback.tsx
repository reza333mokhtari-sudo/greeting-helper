import { createFileRoute, redirect } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/auth/callback')({
  loader: async ({ search }) => {
    // Supabase JS client handles the code exchange automatically when detectSessionInUrl is true,
    // which it is in our client.ts. We just need to wait for it or trigger it.
    // However, TanStack Start is SSR-first. On the client, the proxy supabase client
    // will initialize and pick up the session from the URL hash/query.
    
    // We redirect to the home page where the session will be hydrated.
    throw redirect({ to: '/' });
  },
});
