import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  getProfileByUsername,
  getProfileStats,
  isFollowing,
  listUserPosts,
  toggleFollow,
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

function ProfilePage() {
  const { username } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: posts } = useQuery({
    queryKey: ["user-posts", profile?.id],
    queryFn: () => listUserPosts(profile!.id),
    enabled: !!profile,
  });

  const follow = useMutation({
    mutationFn: () => toggleFollow(profile!.id, !!following),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["is-following"] });
      queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isMe = user?.id === profile?.id;

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-4 p-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="px-6 py-24 text-center">
          <h1 className="text-lg font-semibold">Profile not found</h1>
          <Button asChild className="mt-6">
            <Link to="/">Back to feed</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <header className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24">
            {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
            <AvatarFallback className="text-2xl">
              {profile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <h1 className="text-xl font-semibold">{profile.username}</h1>
              {isMe ? (
                <Button asChild variant="secondary" size="sm">
                  <Link to="/settings">Edit profile</Link>
                </Button>
              ) : user ? (
                <Button
                  size="sm"
                  variant={following ? "secondary" : "default"}
                  onClick={() => follow.mutate()}
                  disabled={follow.isPending}
                >
                  {following ? "Following" : "Follow"}
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link to="/auth">Sign in to follow</Link>
                </Button>
              )}
            </div>
            <dl className="mt-4 flex justify-center gap-8 text-sm sm:justify-start">
              <div>
                <dt className="inline text-muted-foreground">posts </dt>
                <dd className="inline font-semibold">{stats?.posts ?? 0}</dd>
              </div>
              <div>
                <dt className="inline text-muted-foreground">followers </dt>
                <dd className="inline font-semibold">{stats?.followers ?? 0}</dd>
              </div>
              <div>
                <dt className="inline text-muted-foreground">following </dt>
                <dd className="inline font-semibold">{stats?.following ?? 0}</dd>
              </div>
            </dl>
            {profile.full_name && <p className="mt-3 text-sm font-medium">{profile.full_name}</p>}
            {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
          </div>
        </header>

        <section className="mt-10 space-y-6 border-t border-border pt-6">
          <h2 className="sr-only">Posts</h2>
          {(posts ?? []).length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No posts yet.</p>
          ) : (
            (posts ?? []).map((post) => <PostCard key={post.id} post={post} />)
          )}
        </section>
      </div>
    </AppShell>
  );
}
