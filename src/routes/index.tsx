import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Map, Shield, Zap } from "lucide-react";

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
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Nav */}
      <header className="flex h-16 items-center justify-between border-b border-border/40 px-6 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-primary flex items-center justify-center">
            <Map className="size-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">DUNGEON SCRAWL</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/auth" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
          <Button asChild size="sm">
            <Link to="/editor">Launch Editor</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1">
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
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link to="/editor">Get Started for Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link to="/auth" search={{ tab: "up" } as any}>Create Pro Account</Link>
            </Button>
          </div>
          
          <div className="mt-20 rounded-xl border border-border/50 bg-muted/30 p-2 shadow-2xl">
             <div className="aspect-video w-full max-w-5xl rounded-lg bg-card flex items-center justify-center border border-border/20">
                <span className="text-muted-foreground italic">Editor Preview Interface</span>
             </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-6 bg-muted/20">
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="size-6" />
              </div>
              <h3 className="text-xl font-semibold">AI Cartographer</h3>
              <p className="text-sm text-muted-foreground">Natural language commands to generate complex rooms and corridors instantly.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="size-6" />
              </div>
              <h3 className="text-xl font-semibold">Cloud Sync</h3>
              <p className="text-sm text-muted-foreground">Your maps follow you everywhere. Start on web, continue on desktop, access anywhere.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="size-6" />
              </div>
              <h3 className="text-xl font-semibold">Cross-Platform</h3>
              <p className="text-sm text-muted-foreground">High-performance React web app and native C++/Qt desktop client for power users.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-12 px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-sm text-muted-foreground">© 2026 Dungeon Scrawl Editor. Built with Lovable Cloud.</span>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
