import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export type Post = {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
};

export type FeedPost = Post & {
  author: Profile | null;
  signedUrl: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

const SIGNED_TTL = 60 * 60;

export async function signedUrlFor(path: string): Promise<string> {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from("posts").createSignedUrl(path, SIGNED_TTL);
  return data?.signedUrl ?? "";
}

async function signMany(paths: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter((p) => p && !p.startsWith("http")))];
  const map: Record<string, string> = {};
  for (const p of paths) if (p?.startsWith("http")) map[p] = p;
  if (unique.length === 0) return map;
  const { data } = await supabase.storage.from("posts").createSignedUrls(unique, SIGNED_TTL);
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
  }
  return map;
}

async function decorate(posts: Post[]): Promise<FeedPost[]> {
  if (posts.length === 0) return [];
  const ids = posts.map((p) => p.id);
  const authorIds = [...new Set(posts.map((p) => p.user_id))];
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [urls, profilesRes, likesRes, commentsRes] = await Promise.all([
    signMany(posts.map((p) => p.image_url)),
    supabase.from("profiles").select("id,username,full_name,bio,avatar_url").in("id", authorIds),
    supabase.from("likes").select("post_id,user_id").in("post_id", ids),
    supabase.from("comments").select("post_id").in("post_id", ids),
  ]);

  const profiles = new Map((profilesRes.data ?? []).map((p) => [p.id, p as Profile]));
  const likes = likesRes.data ?? [];
  const comments = commentsRes.data ?? [];

  return posts.map((p) => ({
    ...p,
    author: profiles.get(p.user_id) ?? null,
    signedUrl: urls[p.image_url] ?? "",
    likeCount: likes.filter((l) => l.post_id === p.id).length,
    commentCount: comments.filter((c) => c.post_id === p.id).length,
    likedByMe: !!user && likes.some((l) => l.post_id === p.id && l.user_id === user.id),
  }));
}

export async function listFeed(limit = 30): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id,user_id,image_url,caption,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return decorate((data ?? []) as Post[]);
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,username,full_name,bio,avatar_url")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

export async function getMyProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id,username,full_name,bio,avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  return (data as Profile) ?? null;
}

export async function listUserPosts(userId: string): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id,user_id,image_url,caption,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return decorate((data ?? []) as Post[]);
}

export async function getProfileStats(userId: string) {
  const [posts, followers, following] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", userId),
    supabase
      .from("follows")
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);
  return {
    posts: posts.count ?? 0,
    followers: followers.count ?? 0,
    following: following.count ?? 0,
  };
}

export async function isFollowing(targetId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetId)
    .maybeSingle();
  return !!data;
}

export async function toggleFollow(targetId: string, currentlyFollowing: boolean) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to follow people");
  if (currentlyFollowing) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: targetId });
    if (error) throw error;
  }
}

export async function toggleLike(postId: string, liked: boolean) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to like posts");
  if (liked) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
    if (error) throw error;
  }
}

export type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  author: Profile | null;
};

export async function listComments(postId: string): Promise<CommentRow[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("id,body,created_at,user_id")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return [];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,username,full_name,bio,avatar_url")
    .in("id", [...new Set(rows.map((r) => r.user_id))]);
  const map = new Map((profiles ?? []).map((p) => [p.id, p as Profile]));
  return rows.map((r) => ({ ...r, author: map.get(r.user_id) ?? null }));
}

export async function addComment(postId: string, body: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to comment");
  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: user.id, body });
  if (error) throw error;
}

export async function createPost(file: File, caption: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to post");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("posts").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (upErr) throw upErr;
  const { data, error } = await supabase
    .from("posts")
    .insert({ user_id: user.id, image_url: path, caption: caption.trim() || null })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function deletePost(postId: string) {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}

export async function updateProfile(values: {
  username: string;
  full_name: string | null;
  bio: string | null;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in first");
  const { error } = await supabase.from("profiles").update(values).eq("id", user.id);
  if (error) throw error;
}
