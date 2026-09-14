import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/social";

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type Conversation = {
  partner: Profile;
  lastMessage: Message;
  unread: number;
};

async function currentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function profilesByIds(ids: string[]): Promise<Map<string, Profile>> {
  if (ids.length === 0) return new Map();
  const { data } = await supabase
    .from("profiles")
    .select("id,username,full_name,bio,avatar_url")
    .in("id", ids);
  return new Map(((data ?? []) as Profile[]).map((p) => [p.id, p]));
}

export async function listConversations(): Promise<Conversation[]> {
  const me = await currentUserId();
  if (!me) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("id,sender_id,recipient_id,body,read_at,created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw error;
  const rows = (data ?? []) as Message[];

  const latest = new Map<string, Message>();
  const unread = new Map<string, number>();
  for (const m of rows) {
    const partnerId = m.sender_id === me ? m.recipient_id : m.sender_id;
    if (!latest.has(partnerId)) latest.set(partnerId, m);
    if (m.recipient_id === me && !m.read_at) {
      unread.set(partnerId, (unread.get(partnerId) ?? 0) + 1);
    }
  }

  const profiles = await profilesByIds([...latest.keys()]);
  return [...latest.entries()]
    .map(([partnerId, lastMessage]) => {
      const partner = profiles.get(partnerId);
      if (!partner) return null;
      return { partner, lastMessage, unread: unread.get(partnerId) ?? 0 };
    })
    .filter((c): c is Conversation => c !== null);
}

export async function unreadCount(): Promise<number> {
  const me = await currentUserId();
  if (!me) return 0;
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", me)
    .is("read_at", null);
  return count ?? 0;
}

export async function listThread(partnerId: string): Promise<Message[]> {
  const me = await currentUserId();
  if (!me) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("id,sender_id,recipient_id,body,read_at,created_at")
    .or(
      `and(sender_id.eq.${me},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${me})`,
    )
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function markThreadRead(partnerId: string) {
  const me = await currentUserId();
  if (!me) return;
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", me)
    .eq("sender_id", partnerId)
    .is("read_at", null);
}

export async function sendMessage(partnerId: string, body: string) {
  const me = await currentUserId();
  if (!me) throw new Error("Sign in to send messages");
  const text = body.trim();
  if (!text) return;
  const { error } = await supabase
    .from("messages")
    .insert({ sender_id: me, recipient_id: partnerId, body: text });
  if (error) throw error;
}

export async function listPeople(limit = 30): Promise<Profile[]> {
  const me = await currentUserId();
  let query = supabase
    .from("profiles")
    .select("id,username,full_name,bio,avatar_url")
    .order("username")
    .limit(limit);
  if (me) query = query.neq("id", me);
  const { data } = await query;
  return (data ?? []) as Profile[];
}
