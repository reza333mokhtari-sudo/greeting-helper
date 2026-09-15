import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import { StoriesBar } from "@/components/StoriesBar";
import { useInstagramMode } from "@/hooks/use-instagram-mode";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { listFeed } from "@/lib/social";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Snapgram — Share photos with friends" },
      {
        name: "description",
        content:
          "Snapgram is a simple photo sharing feed. Post pictures, follow friends, like and comment in real time.",
      },
      { property: "og:title", content: "Snapgram — Share photos with friends" },
      {
        property: "og:description",
        content: "Post pictures, follow friends, like and comment on Snapgram.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeedPage,
});

function FeedPage() {
  const { data, isLoading } = useQuery({ queryKey: ["feed"], queryFn: () => listFeed() });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[470px]">
        <h1 className="sr-only">Snapgram feed</h1>
        {isLoading && (
          <div className="space-y-6 p-4">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-9 w-40" />
                <Skeleton className="aspect-square w-full" />
              </div>
            ))}
          </div>
        )}
        {!isLoading && (data ?? []).length === 0 && (
          <div className="px-6 py-20 text-center">
            <h2 className="text-lg font-semibold">No posts yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first to share a photo with the community.
            </p>
            <Button asChild className="mt-6">
              <Link to="/create">Create a post</Link>
            </Button>
          </div>
        )}
        <div className="space-y-6 md:pt-6">
          {(data ?? []).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
