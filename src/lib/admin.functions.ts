import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type PublicTable = keyof Database["public"]["Tables"];

/**
 * Checks if a user has the admin role securely on the server.
 */
export const checkAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    try {
      const { data: isAdmin, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });

      if (error || !isAdmin) {
        // Log denied access
        await (supabaseAdmin.from("admin_audit_logs") as any).insert({
          admin_id: userId,
          action: "ACCESS_DENIED",
          table_name: "admin_control_center",
          status: "denied",
          payload: { error: error?.message || "User does not have admin role" },
        });

        console.warn(`[checkAdminAccess] Access denied for user ${userId}`);
        throw new Error("Forbidden");
      }

      // Log successful role check (optional, but requested for "every admin role check")
      await (supabaseAdmin.from("admin_audit_logs") as any).insert({
        admin_id: userId,
        action: "ROLE_CHECK_SUCCESS",
        table_name: "admin_control_center",
        status: "success",
      });

      return { isAdmin: true };
    } catch (e: any) {
      console.error("[checkAdminAccess] Unexpected error:", e);
      throw e.message === "Forbidden" ? e : new Error("Forbidden");
    }
  });

/**
 * Lists all manageable tables from the public schema.
 */
export const getAdminSchema = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  await checkAdminAccess();

  return {
    tables: [
      {
        name: "profiles",
        pk: "id",
        columns: ["id", "display_name", "avatar_url", "created_at"],
        editable: ["display_name", "avatar_url"],
        deletable: false,
      },
      {
        name: "maps",
        pk: "id",
        columns: [
          "id",
          "user_id",
          "name",
          "is_public",
          "thumbnail_url",
          "created_at",
          "updated_at",
        ],
        editable: ["name", "is_public", "thumbnail_url"],
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
        name: "licenses",
        pk: "id",
        columns: ["id", "user_id", "key", "type", "expires_at", "created_at"],
        editable: ["type", "expires_at"],
        deletable: true,
      },
      {
        name: "map_assets",
        pk: "id",
        columns: [
          "id",
          "user_id",
          "name",
          "url",
          "kind",
          "favorite",
          "license",
          "tags",
          "created_at",
        ],
        editable: ["name", "url", "kind", "favorite", "license", "tags"],
        deletable: true,
      },
      {
        name: "cms_pages",
        pk: "id",
        columns: [
          "id",
          "slug",
          "title",
          "body",
          "published",
          "author_id",
          "created_at",
          "updated_at",
        ],
        editable: ["slug", "title", "body", "published"],
        deletable: true,
      },
      {
        name: "support_tickets",
        pk: "id",
        columns: [
          "id",
          "user_id",
          "subject",
          "message",
          "status",
          "priority",
          "assignee_id",
          "created_at",
          "updated_at",
        ],
        editable: ["status", "priority", "assignee_id"],
        deletable: true,
      },
      {
        name: "unverified_users",
        pk: "id",
        columns: ["id", "email", "created_at", "last_sign_in_at", "email_confirmed_at"],
        editable: [],
        deletable: true,
        isVirtual: true,
        baseTable: "auth.users",
      },
      {
        name: "admin_audit_logs",
        pk: "id",
        columns: ["id", "admin_id", "action", "table_name", "row_id", "payload", "created_at"],
        editable: [],
        deletable: false,
      },
    ],
  };
});

/**
 * Generic CRUD operations for admin.
 */
export const adminTableQuery = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        table: z.string(),
        page: z.number().default(0),
        pageSize: z.number().default(20),
        sort: z.object({ column: z.string(), ascending: z.boolean() }).optional(),
        filters: z.record(z.any()).optional(),
        search: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await checkAdminAccess();

    const table = data.table as any;

    // Special handling for unverified users virtual table
    if (table === "unverified_users") {
      // Query users who haven't confirmed their email using the service role client
      let query = supabaseAdmin.auth.admin.listUsers();

      const {
        data: { users },
        error,
      } = await query;
      if (error) throw new Error(error.message);

      const unverifiedUsers = users.filter((u: any) => !u.email_confirmed_at);

      const from = data.page * data.pageSize;
      const to = from + data.pageSize;
      const slicedUsers = unverifiedUsers.slice(from, to);

      return {
        rows: slicedUsers.map((u: any) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          email_confirmed_at: u.email_confirmed_at,
        })),
        count: unverifiedUsers.length,
      };
    }

    // We cast to PostgrestFilterBuilder to ensure all builder methods like range() are recognized
    // by the compiler and present at runtime.
    const tableRef = supabaseAdmin.from(table as PublicTable);
    let query = tableRef.select("*", { count: "exact" });

    if (data.search) {
      // We filter searchable columns. Note: 'profiles' uses 'display_name' instead of 'name'
      const searchColumns =
        table === "profiles"
          ? ["display_name", "email"]
          : ["name", "title", "subject", "email"];
      const filter = searchColumns
        .map((col) => `${col}.ilike.%${data.search}%`)
        .join(",");
      query = query.or(filter);
    }

    const from = data.page * data.pageSize;
    const to = from + data.pageSize - 1;
    query = (query as any).range(from, to);

    if (data.sort) {
      query = query.order(data.sort.column, { ascending: data.sort.ascending });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: rows, count, error } = await query;
    if (error) throw new Error(error.message);

    return { rows, count };
  });

export const adminTableUpdate = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        table: z.string(),
        id: z.string(),
        payload: z.record(z.any()),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as any;
    await checkAdminAccess();

    const table = data.table as PublicTable;

    // Log the action
    await (supabaseAdmin.from("admin_audit_logs") as any).insert({
      admin_id: userId,
      action: "UPDATE",
      table_name: data.table,
      row_id: data.id,
      payload: data.payload,
    });

    const { data: updated, error } = await (supabaseAdmin.from(table) as any)
      .update(data.payload)
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  });

export const adminTableDelete = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        table: z.string(),
        ids: z.array(z.string()),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as any;
    await checkAdminAccess();

    const table = data.table as PublicTable;

    // Log the action
    await (supabaseAdmin.from("admin_audit_logs") as any).insert({
      admin_id: userId,
      action: "DELETE",
      table_name: data.table,
      row_id: data.ids.join(","),
      payload: { ids: data.ids },
    });

    const { error } = await (supabaseAdmin.from(table) as any).delete().in("id", data.ids);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const adminResendVerification = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email: z.string().email() }).parse(d))
  .handler(async ({ data }) => {
    await checkAdminAccess();

    // Using service role to trigger otp email
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const adminVerifyUser = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ userId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId: adminId } = context as any;
    await checkAdminAccess();

    // 1. Update auth.users using admin client
    const { data: user, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      data.userId,
      { email_confirm: true },
    );

    if (updateError) throw new Error(updateError.message);

    // 2. Log audit trail
    await (supabaseAdmin.from("admin_audit_logs") as any).insert({
      admin_id: adminId,
      action: "VERIFY_USER",
      table_name: "auth.users",
      row_id: data.userId,
      payload: { email: user.user.email },
    });

    // 3. (Mock/Simulate) Send confirmation email to client
    console.log(`[Admin] Sending confirmation email to ${user.user.email}`);
    // In production, you would use an email provider like Resend or SendGrid here.

    return { success: true };
  });

export const adminGetUserStats = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ userId: z.string() }).parse(d))
  .handler(async ({ data }) => {
    await checkAdminAccess();

    const { count, error } = await (supabaseAdmin.from("maps") as any)
      .select("*", { count: "exact", head: true })
      .eq("user_id", data.userId);

    if (error) throw new Error(error.message);

    return { mapCount: count || 0 };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ userId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId: adminId } = context as any;
    await checkAdminAccess();

    // 1. Delete user from auth (cascades to user_roles if configured, but let's be safe)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (deleteError) throw new Error(deleteError.message);

    // 2. Log audit trail
    await (supabaseAdmin.from("admin_audit_logs") as any).insert({
      admin_id: adminId,
      action: "DELETE_USER",
      table_name: "auth.users",
      row_id: data.userId,
      payload: { deleted_user_id: data.userId },
    });

    return { success: true };
  });

/**
 * Client-facing support ticket creation.
 */
export const createSupportTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        subject: z.string().min(3).max(100),
        message: z.string().min(10).max(2000),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;

    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: userId,
        subject: data.subject,
        message: data.message,
        priority: data.priority,
        status: "open",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return ticket;
  });

export const getUserTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;

    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  });

export const adminGenerateLicense = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        userId: z.string(),
        type: z.enum(["trial", "pro", "enterprise"]),
        months: z.number().optional(), // 1, 3, 5, 7, 9, 12, 15
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId: adminId } = context as any;
    await checkAdminAccess();

    // 1. Generate key (automatic format compatible with desktop app)
    const prefix = data.type.toUpperCase();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    const key = `${prefix}-${random}`;

    // 2. Set expiry
    const expiresAt = new Date();
    if (data.months) {
      expiresAt.setMonth(expiresAt.getMonth() + data.months);
    } else if (data.type === "trial") {
      expiresAt.setDate(expiresAt.getDate() + 30);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // 3. Save to DB
    const { data: license, error } = await supabaseAdmin
      .from("licenses")
      .insert({
        user_id: data.userId,
        key: key,
        type: data.type,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // 4. Create notification/popup data for user (simulated via metadata or separate table)
    await (supabaseAdmin.from("admin_audit_logs") as any).insert({
      admin_id: adminId,
      action: "GENERATE_LICENSE",
      table_name: "licenses",
      row_id: license.id,
      payload: { key, userId: data.userId, type: data.type },
    });

    return { success: true, key };
  });
