import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Checks if a user has the admin role securely on the server.
 */
export const checkAdminAccess = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { data: isAdmin, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (error || !isAdmin) {
      throw new Error("Forbidden");
    }

    return { isAdmin: true };
  });

/**
 * Lists all manageable tables from the public schema.
 * This uses a server-side admin client to discover the schema if possible,
 * but primarily relies on a registry for safety.
 */
export const getAdminSchema = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    // Verify admin first
    await checkAdminAccess();

    // In a real Supabase environment, we might query information_schema.tables
    // but for now we'll return a robust registry of known tables in this project.
    return {
      tables: [
        {
          name: "profiles",
          pk: "id",
          columns: ["id", "email", "display_name", "avatar_url", "created_at"],
          editable: ["display_name", "avatar_url"],
          deletable: false, // Profiles are tied to auth.users
        },
        {
          name: "maps",
          pk: "id",
          columns: ["id", "user_id", "name", "is_public", "preview_url", "created_at", "updated_at"],
          editable: ["name", "is_public", "preview_url"],
          deletable: true,
        },
        {
          name: "user_roles",
          pk: "id",
          columns: ["id", "user_id", "role", "created_at"],
          editable: ["role"],
          deletable: true,
        },
        {
          name: "map_assets",
          pk: "id",
          columns: ["id", "user_id", "name", "url", "kind", "favorite", "license", "tags", "created_at"],
          editable: ["name", "url", "kind", "favorite", "license", "tags"],
          deletable: true,
        },
        {
          name: "cms_pages",
          pk: "id",
          columns: ["id", "slug", "title", "body", "published", "author_id", "created_at", "updated_at"],
          editable: ["slug", "title", "body", "published"],
          deletable: true,
        },
        {
          name: "support_tickets",
          pk: "id",
          columns: ["id", "user_id", "subject", "message", "status", "priority", "assignee_id", "created_at", "updated_at"],
          editable: ["status", "priority", "assignee_id"],
          deletable: true,
        },
        {
          name: "admin_audit_logs",
          pk: "id",
          columns: ["id", "admin_id", "action", "table_name", "row_id", "payload", "created_at"],
          editable: [],
          deletable: false,
        }
      ]
    };
  });

/**
 * Generic CRUD operations for admin.
 * Uses supabaseAdmin to bypass RLS for administrative tasks where necessary,
 * but only after strict admin verification.
 */
export const adminTableQuery = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    table: z.string(),
    page: z.number().default(0),
    pageSize: z.number().default(20),
    sort: z.object({ column: z.string(), ascending: z.boolean() }).optional(),
    filters: z.record(z.any()).optional(),
    search: z.string().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await checkAdminAccess();

    let query = supabaseAdmin.from(data.table).select("*", { count: "exact" });

    // Handle search (simple ilike on common fields for now)
    if (data.search) {
      // In a real app, we'd look up searchable columns from registry
      query = query.or(`name.ilike.%${data.search}%,email.ilike.%${data.search}%,title.ilike.%${data.search}%,subject.ilike.%${data.search}%`);
    }

    // Handle pagination
    const from = data.page * data.pageSize;
    const to = from + data.pageSize - 1;
    query = query.range(from, to);

    // Handle sort
    if (data.sort) {
      query = query.order(data.sort.column, { ascending: data.sort.ascending });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: rows, count, error } = await query;
    if (error) throw new Error(error.message);

    return { rows, count };
  });

export const adminTableUpdate = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    table: z.string(),
    id: z.string(),
    payload: z.record(z.any()),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context as any;
    await checkAdminAccess();

    // Log the action
    await supabaseAdmin.from("admin_audit_logs").insert({
      admin_id: userId,
      action: "UPDATE",
      table_name: data.table,
      row_id: data.id,
      payload: data.payload,
    });

    const { data: updated, error } = await supabaseAdmin
      .from(data.table)
      .update(data.payload)
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  });

export const adminTableDelete = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    table: z.string(),
    ids: z.array(z.string()),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context as any;
    await checkAdminAccess();

    // Log the action
    await supabaseAdmin.from("admin_audit_logs").insert({
      admin_id: userId,
      action: "DELETE",
      table_name: data.table,
      row_id: data.ids.join(','),
      payload: { ids: data.ids },
    });

    const { error } = await supabaseAdmin
      .from(data.table)
      .delete()
      .in("id", data.ids);

    if (error) throw new Error(error.message);
    return { success: true };
  });
