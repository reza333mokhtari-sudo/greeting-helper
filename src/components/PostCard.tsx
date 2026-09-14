import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addComment, deletePost, listComments, toggleLike, type FeedPost } from "@/lib/social";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function PostCard({ post }: { post: FeedPost }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");

  const username = post.author?.username ?? "someone";

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["feed"] });
    queryClient.invalidateQueries({ queryKey: ["user-posts"] });
  };

  const like = useMutation({
    mutationFn: () => toggleLike(post.id, post.likedByMe),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      toast.success("Post deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => listComments(post.id),
    enabled: showComments,
  });

  const comment = useMutation({
    mutationFn: () => addComment(post.id, draft.trim()),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <article className="border-b border-border pb-6">
      <header className="flex items-center gap-3 px-4 py-3">
        <Link to="/u/$username" params={{ username }}>
          <Avatar className="h-9 w-9">
            {post.author?.avatar_url && <AvatarImage src={post.author.avatar_url} alt="" />}
            <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to="/u/$username"
            params={{ username }}
            className="block truncate text-sm font-semibold hover:underline"
          >
            {username}
          </Link>
          <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
        </div>
        {user?.id === post.user_id && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete post"
            onClick={() => remove.mutate()}
            disabled={remove.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </header>

      {post.signedUrl ? (
        <img
          src={post.signedUrl}
          alt={post.caption ?? `Photo shared by ${username}`}
          loading="lazy"
          className="aspect-square w-full bg-muted object-cover"
        />
      ) : (
        <div className="aspect-square w-full bg-muted" />
      )}

      <div className="flex items-center gap-1 px-2 pt-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label={post.likedByMe ? "Unlike" : "Like"}
          onClick={() => like.mutate()}
        >
          <Heart
            className={cn("h-6 w-6", post.likedByMe && "fill-[var(--like)] text-[var(--like)]")}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Comments"
          onClick={() => setShowComments((v) => !v)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      <div className="space-y-1 px-4">
        <p className="text-sm font-semibold">
          {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
        </p>
        {post.caption && (
          <p className="text-sm">
            <span className="font-semibold">{username}</span> {post.caption}
          </p>
        )}
        {post.commentCount > 0 && !showComments && (
          <button
            className="text-sm text-muted-foreground hover:underline"
            onClick={() => setShowComments(true)}
          >
            View all {post.commentCount} comments
          </button>
        )}
      </div>

      {showComments && (
        <div className="mt-3 space-y-3 px-4">
          {(comments ?? []).map((c) => (
            <p key={c.id} className="text-sm">
              <span className="font-semibold">{c.author?.username ?? "user"}</span> {c.body}
            </p>
          ))}
          {user ? (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) comment.mutate();
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a comment..."
                aria-label="Add a comment"
              />
              <Button type="submit" disabled={!draft.trim() || comment.isPending}>
                Post
              </Button>
            </form>
          ) : (
            <Link to="/auth" className="text-sm text-primary hover:underline">
              Sign in to comment
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
