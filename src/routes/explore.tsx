import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { listFeed } from "@/lib/social";

export const Route = createFileRoute("/explore")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Explore photos — Snapgram" },
      {
        name: "description",
        content: "Browse the newest photos shared by the Snapgram community in a photo grid.",
      },
      { property: "og:title", content: "Explore photos — Snapgram" },
      {
        property: "og:description",
        content: "Browse the newest photos shared by the Snapgram community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const { data, isLoading } = useQuery({ queryKey: ["feed"], queryFn: () => listFeed(60) });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl p-4">
        <h1 className="mb-4 text-xl font-semibold">Explore</h1>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        ) : (data ?? []).length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">Nothing to explore yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {(data ?? []).map((post) => (
              <Link
                key={post.id}
                to="/u/$username"
                params={{ username: post.author?.username ?? "" }}
                className="group relative block aspect-square overflow-hidden bg-muted"
              >
                <img
                  src={post.signedUrl}
                  alt={post.caption ?? "Shared photo"}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
