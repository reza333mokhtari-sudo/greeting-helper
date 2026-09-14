import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Home, Compass, PlusSquare, User, LogOut, LogIn } from "lucide-react";
import type { ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { getMyProfile } from "@/lib/social";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function NavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: typeof Home;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground [&.active]:font-semibold [&.active]:text-foreground"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: getMyProfile,
    enabled: !!user,
  });

  const profileHref = profile ? `/u/${profile.username}` : "/auth";

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/" className="brand-wordmark text-2xl">
            Snapgram
          </Link>
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
      </header>

      <div className="mx-auto flex w-full max-w-6xl">
        <aside className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col gap-1 border-r border-border px-3 py-6 md:flex lg:w-60">
          <Link to="/" className="brand-wordmark mb-6 px-3 text-2xl">
            <span className="hidden lg:inline">Snapgram</span>
            <span className="lg:hidden">S</span>
          </Link>
          <NavItem to="/" label="Home" icon={Home} />
          <NavItem to="/explore" label="Explore" icon={Compass} />
          <NavItem to="/create" label="Create" icon={PlusSquare} />
          <NavItem to={profileHref} label="Profile" icon={User} />
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
                <Avatar className="h-7 w-7">
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
          <Link to={profileHref} aria-label="Profile" className="p-2">
            <User className="h-6 w-6" />
          </Link>
        </div>
      </nav>
    </div>
  );
}
