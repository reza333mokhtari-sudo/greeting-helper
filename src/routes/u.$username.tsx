import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Grid3x3, Link2, Rows3, Settings, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import {
  getProfileByUsername,
  getProfileStats,
  isFollowing,
  listFollowers,
  listFollowing,
  listUserPosts,
  toggleFollow,
  uploadAvatar,
  type Profile,
} from "@/lib/social";

export const Route = createFileRoute("/u/$username")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — Snapgram` },
      {
        name: "description",
        content: `See photos, followers and posts shared by @${params.username} on Snapgram.`,
      },
      { property: "og:title", content: `@${params.username} on Snapgram` },
      {
        property: "og:description",
        content: `See photos and posts shared by @${params.username}.`,
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function StatButton({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="font-semibold">{value}</span>{" "}
      <span className="text-muted-foreground">{label}</span>
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className="text-sm hover:underline">
      {content}
    </button>
  ) : (
    <span className="text-sm">{content}</span>
  );
}

function PeopleDialog({
  title,
  open,
  onOpenChange,
  people,
  loading,
}: {
  title: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  people: Profile[];
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {loading && <Skeleton className="h-10 w-full" />}
        {!loading && people.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">Nobody here yet.</p>
        )}
        <ul className="max-h-80 space-y-1 overflow-y-auto">
          {people.map((p) => (
            <li key={p.id}>
              <Link
                to="/u/$username"
                params={{ username: p.username }}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent"
              >
                <Avatar className="h-9 w-9">
                  {p.avatar_url && <AvatarImage src={p.avatar_url} alt="" />}
                  <AvatarFallback>{p.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{p.username}</span>
                  {p.full_name && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {p.full_name}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function ProfilePage() {
  const { username } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [peopleTab, setPeopleTab] = useState<"followers" | "following" | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => getProfileByUsername(username),
  });

  const { data: stats } = useQuery({
    queryKey: ["profile-stats", profile?.id],
    queryFn: () => getProfileStats(profile!.id),
    enabled: !!profile,
  });

  const { data: following } = useQuery({
    queryKey: ["is-following", profile?.id, user?.id],
    queryFn: () => isFollowing(profile!.id),
    enabled: !!profile && !!user,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["user-posts", profile?.id],
    queryFn: () => listUserPosts(profile!.id),
    enabled: !!profile,
  });

  const { data: people, isLoading: peopleLoading } = useQuery({
    queryKey: ["profile-people", peopleTab, profile?.id],
    queryFn: () =>
      peopleTab === "followers" ? listFollowers(profile!.id) : listFollowing(profile!.id),
    enabled: !!profile && !!peopleTab,
  });

  const follow = useMutation({
    mutationFn: () => toggleFollow(profile!.id, !!following),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["is-following"] });
      queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
      queryClient.invalidateQueries({ queryKey: ["profile-people"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const avatar = useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: () => {
      toast.success("Profile photo updated");
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isMe = !!user && user.id === profile?.id;

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-6 p-6">
          <div className="flex gap-6">
            <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="px-6 py-24 text-center">
          <h1 className="text-lg font-semibold">Profile not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            There is no account with the name @{username}.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Back to feed</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const gallery = posts ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <header className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
          <div className="relative">
            <span className="ring-story block rounded-full p-[3px]">
              <span className="block rounded-full bg-background p-[2px]">
                <Avatar className="h-24 w-24 md:h-32 md:w-32">
                  {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
                  <AvatarFallback className="text-2xl">
                    {profile.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </span>
            </span>
            {isMe && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) avatar.mutate(f);
                    e.target.value = "";
                  }}
                />
                <Button
                  size="icon"
                  className="absolute bottom-1 right-1 h-8 w-8 rounded-full shadow"
                  aria-label="Change profile photo"
                  disabled={avatar.isPending}
                  onClick={() => fileRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <h1 className="text-xl font-semibold">{profile.username}</h1>
              {isMe ? (
                <>
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/account/settings">Edit profile</Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon" aria-label="Settings">
                    <Link to="/account/settings">
                      <Settings className="h-5 w-5" />
                    </Link>
                  </Button>
                </>
              ) : user ? (
                <>
                  <Button
                    size="sm"
                    variant={following ? "secondary" : "default"}
                    onClick={() => follow.mutate()}
                    disabled={follow.isPending}
                  >
                    {following ? "Following" : "Follow"}
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link to="/messages/$username" params={{ username: profile.username }}>
                      <MessageCircle className="mr-1 h-4 w-4" /> Message
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild size="sm">
                  <Link to="/auth">Sign in to follow</Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Copy profile link"
                onClick={() => {
                  navigator.clipboard
                    .writeText(`${window.location.origin}/u/${profile.username}`)
                    .then(() => toast.success("Profile link copied"))
                    .catch(() => toast.error("Could not copy the link"));
                }}
              >
                <Link2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-4 flex justify-center gap-8 sm:justify-start">
              <StatButton label="posts" value={stats?.posts ?? 0} />
              <StatButton
                label="followers"
                value={stats?.followers ?? 0}
                onClick={() => setPeopleTab("followers")}
              />
              <StatButton
                label="following"
                value={stats?.following ?? 0}
                onClick={() => setPeopleTab("following")}
              />
            </div>

            {profile.full_name && <p className="mt-4 text-sm font-medium">{profile.full_name}</p>}
            {profile.bio && (
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                {profile.bio}
              </p>
            )}
          </div>
        </header>

        <Tabs defaultValue="grid" className="mt-10">
          <TabsList className="mx-auto grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="grid">
              <Grid3x3 className="mr-2 h-4 w-4" /> Grid
            </TabsTrigger>
            <TabsTrigger value="list">
              <Rows3 className="mr-2 h-4 w-4" /> Posts
            </TabsTrigger>
          </TabsList>

          {postsLoading && (
            <div className="mt-6 grid grid-cols-3 gap-1">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
          )}

          {!postsLoading && gallery.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">
                {isMe ? "You haven't shared a photo yet." : "No posts yet."}
              </p>
              {isMe && (
                <Button asChild className="mt-6">
                  <Link to="/create">Share your first photo</Link>
                </Button>
              )}
            </div>
          )}

          {gallery.length > 0 && (
            <>
              <TabsContent value="grid" className="mt-6">
                <ul className="grid grid-cols-3 gap-1 md:gap-2">
                  {gallery.map((post) => (
                    <li key={post.id} className="relative">
                      <img
                        src={post.signedUrl}
                        alt={post.caption ?? `Photo by ${profile.username}`}
                        loading="lazy"
                        className="aspect-square w-full rounded-sm bg-muted object-cover"
                      />
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="list" className="mt-6 space-y-6">
                {gallery.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <PeopleDialog
        title={peopleTab === "following" ? "Following" : "Followers"}
        open={peopleTab !== null}
        onOpenChange={(v) => setPeopleTab(v ? peopleTab : null)}
        people={people ?? []}
        loading={peopleLoading}
      />
    </AppShell>
  );
}
