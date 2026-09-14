import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { listConversations, listPeople } from "@/lib/chat";

export const Route = createFileRoute("/_authenticated/messages/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Messages — Snapgram" },
      {
        name: "description",
        content: "Your private Snapgram chats. Send direct messages to people you follow.",
      },
      { property: "og:title", content: "Messages — Snapgram" },
      { property: "og:description", content: "Private direct messages on Snapgram." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: listConversations,
    refetchInterval: 15000,
  });
  const { data: people } = useQuery({ queryKey: ["chat-people"], queryFn: () => listPeople(20) });

  const known = new Set((conversations ?? []).map((c) => c.partner.id));
  const suggestions = (people ?? []).filter((p) => !known.has(p.id));

  return (
    <AppShell>
      <div className="mx-auto max-w-xl p-4 md:p-8">
        <h1 className="text-xl font-semibold">Messages</h1>

        {isLoading && (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        )}

        {!isLoading && (conversations ?? []).length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">
            No conversations yet. Start one from the list below.
          </p>
        )}

        <ul className="mt-4 divide-y divide-border">
          {(conversations ?? []).map((c) => (
            <li key={c.partner.id}>
              <Link
                to="/messages/$username"
                params={{ username: c.partner.username }}
                className="flex items-center gap-3 py-3"
              >
                <Avatar className="h-11 w-11">
                  {c.partner.avatar_url && <AvatarImage src={c.partner.avatar_url} alt="" />}
                  <AvatarFallback>{c.partner.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{c.partner.username}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {c.lastMessage.body}
                  </span>
                </span>
                {c.unread > 0 && (
                  <span className="rounded-full bg-[var(--like)] px-2 py-0.5 text-[11px] font-semibold text-white">
                    {c.unread}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {suggestions.length > 0 && (
          <>
            <h2 className="mt-8 text-sm font-semibold text-muted-foreground">Start a chat</h2>
            <ul className="mt-2 divide-y divide-border">
              {suggestions.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/messages/$username"
                    params={{ username: p.username }}
                    className="flex items-center gap-3 py-3"
                  >
                    <Avatar className="h-9 w-9">
                      {p.avatar_url && <AvatarImage src={p.avatar_url} alt="" />}
                      <AvatarFallback>{p.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{p.username}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </AppShell>
  );
}
