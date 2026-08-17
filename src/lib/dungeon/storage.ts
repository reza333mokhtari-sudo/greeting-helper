import { supabase } from "@/integrations/supabase/client";
import type { Doc } from "./model";

const LOCAL_DB_KEY = "dungeon-local-maps";

export type LocalMapMetadata = {
  id: string;
  name: string;
  lastModified: number;
  isCloud?: boolean;
};

export async function saveMapLocally(doc: Doc, name: string) {
  const mapsRaw = localStorage.getItem(LOCAL_DB_KEY);
  const maps: Record<string, Doc & { name: string; lastModified: number }> = mapsRaw
    ? JSON.parse(mapsRaw)
    : {};

  const mapId = doc.activeFloorId || "local-1"; // Use activeFloorId as a simple ID for now or generate one
  const timestamp = Date.now();

  maps[mapId] = {
    ...doc,
    name,
    lastModified: timestamp,
  };

  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(maps));
  return { id: mapId, timestamp };
}

export async function listLocalMaps(): Promise<LocalMapMetadata[]> {
  const mapsRaw = localStorage.getItem(LOCAL_DB_KEY);
  if (!mapsRaw) return [];
  const maps: Record<string, any> = JSON.parse(mapsRaw);
  return Object.entries(maps).map(([id, data]) => ({
    id,
    name: data.name || "Untitled Map",
    lastModified: data.lastModified || 0,
  }));
}

export async function saveMapToCloud(doc: Doc, name: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not logged in");

  const { data, error } = await supabase
    .from("maps")
    .upsert({
      name,
      doc: doc as any,
      user_id: session.user.id,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Cloud save error:", error);
    throw error;
  }
  return data;
}

export async function listCloudMaps() {
  const { data, error } = await supabase
    .from("maps")
    .select("id, name, updated_at, is_public")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Cloud list error:", error);
    throw error;
  }
  return data;
}
