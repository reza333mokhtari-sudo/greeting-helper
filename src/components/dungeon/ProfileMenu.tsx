import { useState, useEffect } from "react";
import { 
  User, 
  Settings, 
  HelpCircle, 
  LifeBuoy, 
  X, 
  Send, 
  Loader2, 
  MessageSquare, 
  LogOut,
  ShieldCheck,
  Database,
  Key,
  Smartphone,
  Mail,
  UserCheck,
  History,
  Trash2,
  AlertCircle,
  Bell,
  Fingerprint
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { checkHealth } from "@/lib/health.functions";
import { Badge } from "@/components/ui/badge";

export function ProfileMenu({ onAuthRequired }: { onAuthRequired?: ((reason: string) => void) | undefined }) {
  const [activeDialog, setActiveDialog] = useState<"settings" | "help" | "faq" | "support" | null>(null);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Health & Auth Status for inside the menu
  const [health, setHealth] = useState<{ status: string; database: boolean; error: string | null } | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const runHealthCheck = useServerFn(checkHealth);

  const performCheck = async () => {
    try {
      const result = await runHealthCheck();
      setHealth(result);
      const { data: { session } } = await supabase.auth.getSession();
      setAuthStatus(session ? 'authenticated' : 'unauthenticated');
    } catch (err) {
      setHealth({ status: "error", database: false, error: "Connection failed" });
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => {
      setUser(data.user);
      if (data.user) {
        supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" })
          .then(({ data: ok }: any) => {
            (window as any)._isAdmin = !!ok;
            setAuthStatus(prev => prev); 
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      setAuthStatus(session ? 'authenticated' : 'unauthenticated');
    });

    performCheck();
    return () => subscription.unsubscribe();
  }, []);

  const sendTicket = async () => {
    if (!user) {
      toast.error("Please sign in to send a ticket");
      return;
    }
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast.error("Subject and message are required");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject: ticketSubject,
      message: ticketMessage,
      priority: (window as any)._ticketPriority || "medium",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Ticket sent successfully!");
      setTicketSubject("");
      setTicketMessage("");
      setActiveDialog(null);
    }
  };

  const dialogs = {
    settings: { 
      title: "Account Management", 
      desc: "Comprehensive control center for your professional identity and security.",
      content: (
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
            <TabsTrigger value="general" className="text-[10px] font-bold uppercase tracking-tight">General</TabsTrigger>
            <TabsTrigger value="security" className="text-[10px] font-bold uppercase tracking-tight">Security</TabsTrigger>
            <TabsTrigger value="sessions" className="text-[10px] font-bold uppercase tracking-tight">Auditing</TabsTrigger>
            <TabsTrigger value="advanced" className="text-[10px] font-bold uppercase tracking-tight">Prefs</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] mt-4 pr-4">
            <TabsContent value="general" className="space-y-6 mt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary border-2 border-primary/20">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{user?.user_metadata?.display_name || "Dungeon Scrawler"}</h4>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <Badge variant="outline" className="mt-1 text-[9px] font-bold uppercase">Basic Plan</Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase text-muted-foreground">Display Name</Label>
                    <Input placeholder="Enter your name" defaultValue={user?.user_metadata?.display_name} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase text-muted-foreground">Bio / Description</Label>
                    <Textarea placeholder="Tell us about your campaign..." className="resize-none text-xs" rows={3} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6 mt-0">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold">Two-Factor Authentication</h4>
                    <p className="text-[10px] text-muted-foreground">Secure your account with multi-factor verification.</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Magic Link Login</Label>
                    <p className="text-[10px] text-muted-foreground">Receive a secure link via email instead of password.</p>
                  </div>
                  <Switch checked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Login Alerts</Label>
                    <p className="text-[10px] text-muted-foreground">Notify me of new logins from unrecognized devices.</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full text-xs font-bold uppercase h-9 border-destructive/30 text-destructive hover:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4 mt-0">
              <div className="space-y-3">
                <Label className="text-[11px] font-bold uppercase text-muted-foreground">Active Sessions</Label>
                {[
                  { device: "Chrome / macOS", location: "San Francisco, US", current: true, time: "Active now" },
                  { device: "Safari / iPhone", location: "San Francisco, US", current: false, time: "2 hours ago" },
                  { device: "Firefox / Windows", location: "London, UK", current: false, time: "Yesterday" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3 bg-muted/10">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-semibold flex items-center gap-1.5">
                          {s.device} {s.current && <Badge className="text-[8px] h-3.5 px-1 bg-green-500/10 text-green-500 border-green-500/20">CURRENT</Badge>}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{s.location} • {s.time}</p>
                      </div>
                    </div>
                    {!s.current && <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-destructive">REVOKE</Button>}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Auto-Save Cloud</Label>
                    <p className="text-[10px] text-muted-foreground">Automatically sync changes to your cloud library.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Enhanced UI Effects</Label>
                    <p className="text-[10px] text-muted-foreground">Enable shadows and complex CSS transitions.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Experimental 3D Library</Label>
                    <p className="text-[10px] text-muted-foreground">Early access to high-fidelity 3D map assets.</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
          
          <div className="mt-6">
             <Button className="w-full shadow-xl shadow-primary/20 h-10 font-bold uppercase tracking-wider text-xs">Commit Updates</Button>
          </div>
        </Tabs>
      )
    },
    help: { 
      title: "Help & Documentation", 
      desc: "Everything you need to know about using Dungeon Scrawl.",
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>Dungeon Scrawl is a powerful dungeon map maker with a hand-drawn aesthetic.</p>
          <ul className="list-disc pl-4 space-y-2">
            <li><strong>Drawing:</strong> Use the toolbar to create rooms (rectangles), corridors (paths), and custom polygons.</li>
            <li><strong>Floors:</strong> Manage multiple levels in your dungeon using the Floors panel.</li>
            <li><strong>AI Agent:</strong> Use the AI panel to generate rooms or encounters automatically.</li>
            <li><strong>Export:</strong> Export your creations as PNG, SVG, or high-quality PDF.</li>
          </ul>
        </div>
      )
    },
    faq: { 
      title: "Frequently Asked Questions", 
      desc: "Answers to common questions about the platform.",
      content: (
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-foreground">How do I share my map?</h4>
            <p className="text-xs text-muted-foreground">Open the cloud panel, make your map 'Public', and copy the share link.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-medium text-foreground">Can I use my own images?</h4>
            <p className="text-xs text-muted-foreground">Yes! Use the Props panel to upload custom textures or prop images.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-medium text-foreground">Is there a player view?</h4>
            <p className="text-xs text-muted-foreground">Yes, use the 'Player View' toggle in the View menu to see what your players see (with Fog of War active).</p>
          </div>
        </div>
      )
    },
    support: { 
      title: "Support Site", 
      desc: "Submit a ticket to our administration team.",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-[11px] uppercase tracking-wider text-muted-foreground">Priority</Label>
            <Select onValueChange={(v) => (window as any)._ticketPriority = v} defaultValue="medium">
              <SelectTrigger id="priority" className="h-9">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (Feedback/Idea)</SelectItem>
                <SelectItem value="medium">Medium (Issue)</SelectItem>
                <SelectItem value="high">High (Bug/Blocker)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-[11px] uppercase tracking-wider text-muted-foreground">Subject</Label>
            <Input 
              id="subject"
              placeholder="What do you need help with?" 
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-[11px] uppercase tracking-wider text-muted-foreground">Message</Label>
            <Textarea 
              id="message"
              placeholder="Describe your issue or suggestion in detail..." 
              rows={4}
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              className="resize-none"
            />
          </div>
          <Button className="w-full shadow-lg shadow-primary/10" onClick={sendTicket} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Ticket
          </Button>
        </div>
      )
    },
  };

  return (
    <>
      <DropdownMenu onOpenChange={(open) => open && performCheck()}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 w-10 rounded-full p-0 hover:bg-primary/10 transition-colors border border-border/40 shadow-sm overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 text-xs font-medium text-primary">
              {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                <img 
                  src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2 shadow-2xl">
          <DropdownMenuLabel className="flex flex-col px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wider">{user?.user_metadata?.display_name || "Account Profile"}</span>
            {user && <span className="text-[10px] font-normal text-muted-foreground truncate opacity-70">{user.email}</span>}
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="mx-1" />
          
          <div className="grid grid-cols-2 gap-1 p-1">
            <div className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5">
              {health?.database ? <Database className="h-3 w-3 text-green-500" /> : <Database className="h-3 w-3 text-red-500" />}
              <span className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground">DB: {health?.database ? "LIVE" : "DOWN"}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5">
              {authStatus === 'authenticated' ? <ShieldCheck className="h-3 w-3 text-blue-500" /> : <Key className="h-3 w-3 text-orange-500" />}
              <span className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground">AUTH: {authStatus === 'authenticated' ? "SECURE" : "GUEST"}</span>
            </div>
          </div>

          <DropdownMenuSeparator className="mx-1" />
          {user ? (
            <DropdownMenuItem onClick={() => setActiveDialog("settings")} className="text-xs font-medium cursor-pointer py-2">
              <Settings className="mr-2 h-4 w-4 opacity-70" /> User Settings
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onClick={() => setActiveDialog("help")} className="text-xs font-medium cursor-pointer py-2">
            <HelpCircle className="mr-2 h-4 w-4 opacity-70" /> Help Center
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveDialog("faq")} className="text-xs font-medium cursor-pointer py-2">
            <MessageSquare className="mr-2 h-4 w-4 opacity-70" /> FAQ Library
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveDialog("support")} className="text-xs font-medium cursor-pointer py-2">
            <LifeBuoy className="mr-2 h-4 w-4 opacity-70" /> Admin Support
          </DropdownMenuItem>
          {user && (window as any)._isAdmin && (
            <DropdownMenuItem asChild className="text-xs font-bold text-blue-500 cursor-pointer py-2">
              <Link to="/admin">
                <ShieldCheck className="mr-2 h-4 w-4 opacity-70" /> Control Center
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="mx-1" />
          {user ? (
            <DropdownMenuItem 
              className="text-xs font-medium text-destructive cursor-pointer py-2"
              onClick={async () => {
                await supabase.auth.signOut();
                toast.success("Signed out");
                window.location.href = "/";
              }}
            >
              <LogOut className="mr-2 h-4 w-4 opacity-70" /> Sign Out
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              className="text-[10px] font-bold uppercase text-muted-foreground/40 disabled cursor-default py-2 justify-center"
              disabled
            >
              Guest Session
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>

      </DropdownMenu>

      <Dialog open={!!activeDialog} onOpenChange={(o) => !o && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
          {activeDialog && (
            <div className="flex flex-col">
              <div className="p-6 pb-2">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold tracking-tight">{dialogs[activeDialog].title}</DialogTitle>
                  <DialogDescription className="text-xs">{dialogs[activeDialog].desc}</DialogDescription>
                </DialogHeader>
              </div>
              <div className="px-6 pb-6 pt-2">
                {dialogs[activeDialog].content}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
