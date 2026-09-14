import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listThread, markThreadRead, sendMessage } from "@/lib/chat";
import { getProfileByUsername } from "@/lib/social";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/messages/$username")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Chat — Snapgram" },
      { name: "description", content: "A private Snapgram conversation." },
      { property: "og:title", content: "Chat — Snapgram" },
      { property: "og:description", content: "A private Snapgram conversation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { username } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { data: partner } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => getProfileByUsername(username),
  });

  const { data: messages } = useQuery({
    queryKey: ["thread", partner?.id],
    queryFn: () => listThread(partner!.id),
    enabled: !!partner,
    refetchInterval: 8000,
  });

  useEffect(() => {
    if (partner) markThreadRead(partner.id).then(() => {
      queryClient.invalidateQueries({ queryKey: ["unread-messages"] });
    });
  }, [partner, messages?.length, queryClient]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  const send = useMutation({
    mutationFn: () => sendMessage(partner!.id, draft),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["thread", partner?.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!partner) {
    return (
      <AppShell>
        <div className="p-8 text-sm text-muted-foreground">Loading conversation…</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-xl flex-col p-4 md:h-[calc(100vh-4rem)] md:p-8">
        <header className="flex items-center gap-3 border-b border-border pb-3">
          <Button asChild variant="ghost" size="icon" aria-label="Back to messages">
            <Link to="/messages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Link
            to="/u/$username"
            params={{ username: partner.username }}
            className="flex items-center gap-2"
          >
            <Avatar className="h-9 w-9">
              {partner.avatar_url && <AvatarImage src={partner.avatar_url} alt="" />}
              <AvatarFallback>{partner.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h1 className="text-sm font-semibold">{partner.username}</h1>
          </Link>
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto py-4">
          {(messages ?? []).length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Say hello to {partner.username}.
            </p>
          )}
          {(messages ?? []).map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <p
                  className={cn(
                    "max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm",
                    mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {m.body}
                </p>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <form
          className="flex items-center gap-2 border-t border-border pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) send.mutate();
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${partner.username}`}
            aria-label="Message"
          />
          <Button type="submit" size="icon" disabled={!draft.trim() || send.isPending}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
