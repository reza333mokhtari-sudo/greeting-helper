import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const saveMapOffline = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    id: z.string(),
    name: z.string(),
    data: z.any(),
    lastModified: z.number()
  }).parse(data))
  .handler(async ({ data }) => {
    // This is a stub for server-side persistence if needed later.
    // For now, we rely on local storage for offline and Supabase for online.
    return { success: true, timestamp: Date.now() };
  });

export const getMapData = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    return { id: data.id, exists: false };
  });
