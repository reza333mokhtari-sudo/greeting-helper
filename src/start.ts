import { createStart, createMiddleware, createCsrfMiddleware } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";


export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [
    createCsrfMiddleware({
      filter: (ctx) => ctx.handlerType === "serverFn",
    }),
  ],
}));
