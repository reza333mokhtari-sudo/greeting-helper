import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { listPeople } from "@/lib/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/** Instagram-style stories strip. Shows community members as story bubbles. */
export function StoriesBar() {
  const { data } = useQuery({ queryKey: ["story-people"], queryFn: () => listPeople(12) });
  const people = data ?? [];
  if (people.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto border-b border-border px-4 py-4 md:rounded-xl md:border md:px-5">
      {people.map((p) => (
        <Link
          key={p.id}
          to="/u/$username"
          params={{ username: p.username }}
          className="flex w-16 shrink-0 flex-col items-center gap-1"
        >
          <span className="ring-story rounded-full p-[2px]">
            <span className="block rounded-full bg-background p-[2px]">
              <Avatar className="h-14 w-14">
                {p.avatar_url && <AvatarImage src={p.avatar_url} alt="" />}
                <AvatarFallback>{p.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </span>
          </span>
          <span className="w-16 truncate text-center text-[11px] text-muted-foreground">
            {p.username}
          </span>
        </Link>
      ))}
    </div>
  );
}
