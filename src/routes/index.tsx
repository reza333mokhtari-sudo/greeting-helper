import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Map, Shield, Zap, Layout, Plus, ArrowRight, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listLocalMaps, listCloudMaps } from "@/lib/dungeon/storage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dungeon Scrawl — Professional RPG Map Maker" },
      { name: "description", content: "The next generation of dungeon mapping. AI-assisted, high-fidelity, and cross-platform." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [maps, setMaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        try {
          const [local, cloud] = await Promise.all([
            listLocalMaps().catch(() => []),
            listCloudMaps().catch(() => [])
          ]);
          
          const combined = [
            ...cloud.map(m => ({ ...m, isCloud: true })),
            ...local.map(m => ({ ...m, isCloud: false, updated_at: new Date(m.lastModified).toISOString() }))
          ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
          
          setMaps(combined.slice(0, 4));
        } catch (err) {
          console.error("Failed to fetch maps:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Nav */}
      <header className="flex h-16 items-center justify-between border-b border-border/40 px-6 backdrop-blur sticky top-0 z-50 bg-background/80">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-primary flex items-center justify-center">
            <Map className="size-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">DUNGEON SCRAWL</span>
        </div>
        <nav className="flex items-center gap-4">
          {user ? (
            <Link to="/editor" className="flex items-center gap-2 group">
               <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="size-full object-cover" />
                ) : (
                  <User className="size-4 text-primary" />
                )}
               </div>
               <span className="text-sm font-medium hidden sm:inline-block group-hover:text-primary transition-colors">
                 {user.user_metadata?.display_name || user.email?.split('@')[0]}
               </span>
            </Link>
          ) : (
            <Link to="/auth" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
          )}
          <Button asChild size="sm" className="shadow-lg shadow-primary/20">
            <Link to="/editor">Launch Editor</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {user ? (
          <section className="py-12 px-6 max-w-6xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">Welcome back, Traveler.</h2>
                <p className="text-muted-foreground mt-2">Pick up where you left off or start a new quest.</p>
              </div>
              <Button asChild size="lg" className="h-12 px-8">
                <Link to="/editor" className="flex items-center gap-2">
                  <Plus className="size-5" /> Create New Map
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse border border-border/50" />
                ))
              ) : maps.length > 0 ? (
                maps.map((map) => (
                  <Link 
                    key={map.id} 
                    to="/editor" 
                    params={{ mapId: map.id } as any} 
                    className="group relative aspect-[4/3] rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 shadow-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                      <Map className="size-12 text-muted-foreground/20 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                      <div className="flex items-center gap-2">
                         <Badge variant="secondary" className="text-[9px] font-bold uppercase h-4 px-1.5 bg-background/80 backdrop-blur-sm">
                           {map.isCloud ? "Cloud" : "Local"}
                         </Badge>
                         <span className="text-[10px] text-white/60 font-medium">
                           {new Date(map.updated_at).toLocaleDateString()}
                         </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1 truncate">{map.name || "Untitled Map"}</h3>
                    </div>
                    <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                        <ArrowRight className="size-4" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-border/50 rounded-2xl bg-muted/10">
                  <Map className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No maps found in your library.</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/editor">Start your first scrawl</Link>
                  </Button>
                </div>
              )}
            </div>

            <Separator className="opacity-50" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-6">
              <div className="space-y-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="size-6" />
                </div>
                <h3 className="text-xl font-bold">What is Dungeon Scrawl?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dungeon Scrawl is the premier 2D map maker designed specifically for TTRPG enthusiasts. 
                  It combines the simplicity of digital drawing with professional cartography tools, 
                  allowing you to create "old-school" style maps that look like they were pulled right from a handbook.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-start gap-3">
                    <Shield className="size-4 text-primary mt-1" />
                    <span className="text-xs font-medium">Enterprise Security</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="size-4 text-primary mt-1" />
                    <span className="text-xs font-medium">Real-time Rendering</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border/50 bg-muted/20 aspect-video flex items-center justify-center overflow-hidden relative group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Layout className="size-16 text-muted-foreground/20" />
                <span className="absolute bottom-4 left-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Editor Core Visualizer</span>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="relative overflow-hidden py-24 px-6 text-center">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(59,130,246,0.1),transparent)]" />
              <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
                Create Epic Maps <br />
                <span className="text-primary">In Seconds.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                Professional RPG mapping tools powered by AI. Design, share, and play your adventures with the ultimate dungeon editor.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" className="h-12 px-8 text-base shadow-xl shadow-primary/20" asChild>
                  <Link to="/editor">Get Started for Free</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                  <Link to="/auth" search={{ tab: "up" } as any}>Create Pro Account</Link>
                </Button>
              </div>
              
              <div className="mt-20 rounded-xl border border-border/50 bg-muted/30 p-2 shadow-2xl">
                 <div className="aspect-video w-full max-w-5xl mx-auto rounded-lg bg-card flex items-center justify-center border border-border/20 shadow-inner">
                    <Layout className="size-20 text-muted-foreground/10" />
                    <span className="absolute text-muted-foreground text-xs font-medium opacity-50">Editor Live Preview</span>
                 </div>
              </div>
            </section>

            {/* Features */}
            <section className="py-24 px-6 bg-muted/20 border-y border-border/50">
              <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="flex flex-col items-center text-center gap-4 group">
                  <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="size-8" />
                  </div>
                  <h3 className="text-xl font-bold">AI Cartographer</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Natural language commands to generate complex rooms and corridors instantly. No manual drawing required.</p>
                </div>
                <div className="flex flex-col items-center text-center gap-4 group">
                  <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    <Shield className="size-8" />
                  </div>
                  <h3 className="text-xl font-bold">Cloud Sync</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Your maps follow you everywhere. Start on web, continue on desktop, and access your entire library anywhere.</p>
                </div>
                <div className="flex flex-col items-center text-center gap-4 group">
                  <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    <Zap className="size-8" />
                  </div>
                  <h3 className="text-xl font-bold">Professional Tools</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">High-performance vector engine with layers, props, and advanced transformations for professional map makers.</p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-border/40 py-12 px-6 bg-card/30">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Map className="size-4 text-primary" />
            <span className="text-sm font-bold tracking-tight">DUNGEON SCRAWL</span>
          </div>
          <span className="text-xs text-muted-foreground">© 2026 Dungeon Scrawl Editor. Professional Mapping Solutions.</span>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const Separator = ({ className }: { className?: string }) => (
  <div className={`h-px w-full bg-border ${className}`} />
);
