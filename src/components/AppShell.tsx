import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  Compass,
  PlusSquare,
  User,
  LogOut,
  LogIn,
  Send,
  Settings,
  Heart,
} from "lucide-react";
import type { ReactNode } from "react";

import logo from "@/assets/snapgram-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useInstagramMode } from "@/hooks/use-instagram-mode";
import { getMyProfile } from "@/lib/social";
import { unreadCount } from "@/lib/chat";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function NavItem({
  to,
  label,
  icon: Icon,
  badge,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  badge?: number;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground [&.active]:font-semibold [&.active]:text-foreground"
    >
      <span className="relative">
        <Icon className="h-5 w-5" aria-hidden="true" />
        {!!badge && badge > 0 && (
          <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--like)] px-1 text-[10px] font-semibold text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { enabled: igMode } = useInstagramMode();
  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: getMyProfile,
    enabled: !!user,
  });
  const { data: unread } = useQuery({
    queryKey: ["unread-messages", user?.id],
    queryFn: unreadCount,
    enabled: !!user && igMode,
    refetchInterval: 20000,
  });

  const profileHref = profile ? `/u/${profile.username}` : "/auth";

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const Wordmark = (
    <span className="flex items-center gap-2">
      <img
        src={logo}
        alt=""
        width={28}
        height={28}
        className={cn("h-7 w-7", !igMode && "opacity-90")}
      />
      <span className={cn("brand-wordmark text-2xl", igMode && "ig-wordmark")}>Snapgram</span>
    </span>
  );

  return (
    <div className={cn("min-h-screen bg-background", igMode && "ig-mode")}>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/" aria-label="Snapgram home">
            {Wordmark}
          </Link>
          <div className="flex items-center gap-1">
            {igMode && user && (
              <Button asChild variant="ghost" size="icon" aria-label="Messages">
                <Link to="/messages">
                  <Send className="h-5 w-5" />
                </Link>
              </Button>
            )}
            {user ? (
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl">
        <aside className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col gap-1 border-r border-border px-3 py-6 md:flex lg:w-60">
          <Link to="/" className="mb-6 px-3" aria-label="Snapgram home">
            <span className="flex items-center gap-2">
              <img src={logo} alt="" width={28} height={28} className="h-7 w-7" />
              <span className={cn("brand-wordmark hidden text-2xl lg:inline", igMode && "ig-wordmark")}>
                Snapgram
              </span>
            </span>
          </Link>
          <NavItem to="/" label="Home" icon={Home} />
          <NavItem to="/explore" label="Explore" icon={Compass} />
          {igMode && user && (
            <NavItem to="/messages" label="Messages" icon={Send} badge={unread ?? 0} />
          )}
          {igMode && <NavItem to="/explore" label="Activity" icon={Heart} />}
          <NavItem to="/create" label="Create" icon={PlusSquare} />
          <NavItem to={profileHref} label="Profile" icon={User} />
          {user && <NavItem to="/account/settings" label="Settings" icon={Settings} />}
          <div className="mt-auto">
            {user ? (
              <button
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden lg:inline">Sign out</span>
              </button>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent"
              >
                <LogIn className="h-5 w-5" />
                <span className="hidden lg:inline">Sign in</span>
              </Link>
            )}
            {profile && (
              <div className="mt-3 hidden items-center gap-2 px-3 lg:flex">
                <Avatar className={cn("h-7 w-7", igMode && "ring-2 ring-offset-2 ring-offset-background")}>
                  <AvatarFallback>{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="truncate text-xs text-muted-foreground">@{profile.username}</span>
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-20 md:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-around py-2">
          <Link to="/" aria-label="Home" className="p-2">
            <Home className="h-6 w-6" />
          </Link>
          <Link to="/explore" aria-label="Explore" className="p-2">
            <Compass className="h-6 w-6" />
          </Link>
          <Link to="/create" aria-label="Create post" className="p-2">
            <PlusSquare className="h-6 w-6" />
          </Link>
          {igMode && user && (
            <Link to="/messages" aria-label="Messages" className="relative p-2">
              <Send className="h-6 w-6" />
              {!!unread && unread > 0 && (
                <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-[var(--like)]" />
              )}
            </Link>
          )}
          <Link to={profileHref} aria-label="Profile" className="p-2">
            <User className="h-6 w-6" />
          </Link>
        </div>
      </nav>
    </div>
  );
}
