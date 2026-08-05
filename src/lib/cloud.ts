import { supabase } from "@/integrations/supabase/client";
import type { Doc } from "@/lib/dungeon/model";

export type MapRow = {
  id: string;
  name: string;
  thumbnail_url: string | null;
  is_public: boolean;
  share_slug: string;
  updated_at: string;
};

export type AssetRow = { id: string; name: string; kind: string; url: string; tags: string[]; favorite: boolean; license?: string };

const SIGNED_TTL = 60 * 60 * 24 * 365;

export async function listMaps(): Promise<MapRow[]> {
  const { data, error } = await supabase
    .from("maps")
    .select("id,name,thumbnail_url,is_public,share_slug,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MapRow[];
}

export async function loadMap(id: string): Promise<{ name: string; doc: Doc }> {
  const { data, error } = await supabase.from("maps").select("name,doc").eq("id", id).single();
  if (error) throw error;
  return { name: data.name as string, doc: data.doc as unknown as Doc };
}

export async function createMap(name: string, doc: Doc, thumbnail: string | null): Promise<MapRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("maps")
    .insert({ name, doc: doc as never, thumbnail_url: thumbnail, user_id: auth.user.id })
    .select("id,name,thumbnail_url,is_public,share_slug,updated_at")
    .single();
  if (error) throw error;
  return data as MapRow;
}

export async function updateMap(id: string, patch: { name?: string; doc?: Doc; thumbnail_url?: string | null; is_public?: boolean }) {
  const { error } = await supabase
    .from("maps")
    .update(patch as never)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteMap(id: string) {
  const { error } = await supabase.from("maps").delete().eq("id", id);
  if (error) throw error;
}

export async function listAssets(): Promise<AssetRow[]> {
  const { data, error } = await supabase.from("map_assets").select("id,name,kind,url,tags,favorite,license").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AssetRow[];
}

export async function uploadAsset(file: File, kind = "prop", license?: string): Promise<AssetRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not signed in");
  const ext = file.name.split(".").pop() || "png";
  const path = `${auth.user.id}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("map-assets").upload(path, file, { upsert: false, contentType: file.type });
  if (up.error) throw up.error;
  const signed = await supabase.storage.from("map-assets").createSignedUrl(path, SIGNED_TTL);
  if (signed.error) throw signed.error;
  const { data, error } = await supabase
    .from("map_assets")
    .insert({ user_id: auth.user.id, name: file.name.replace(/\.[^.]+$/, ""), kind, url: signed.data.signedUrl, license: license ?? null })
    .select("id,name,kind,url,tags,favorite,license")
    .single();
  if (error) throw error;
  return data as AssetRow;
}

export async function updateAsset(id: string, patch: { name?: string; tags?: string[]; favorite?: boolean; license?: string }) {
  const { error } = await supabase.from("map_assets").update(patch as never).eq("id", id);
  if (error) throw error;
}

export async function deleteAsset(id: string) {
  const { error } = await supabase.from("map_assets").delete().eq("id", id);
  if (error) throw error;
}
