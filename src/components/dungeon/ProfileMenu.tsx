import { useState, useEffect } from "react";
import { User, Settings, HelpCircle, LifeBuoy, X, Send, Loader2, MessageSquare } from "lucide-react";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function ProfileMenu() {
  const [activeDialog, setActiveDialog] = useState<"settings" | "help" | "faq" | "support" | null>(null);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
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
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Ticket sent successfully! Our team will review it.");
      setTicketSubject("");
      setTicketMessage("");
      setActiveDialog(null);
    }
  };

  const dialogs = {
    settings: { 
      title: "Settings", 
      desc: "Manage your account preferences.",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input placeholder="Your name" defaultValue={user?.user_metadata?.display_name} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input disabled value={user?.email || ""} />
          </div>
          <Button className="w-full">Save Changes</Button>
        </div>
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
            <Label>Subject</Label>
            <Input 
              placeholder="What do you need help with?" 
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea 
              placeholder="Describe your issue or suggestion in detail..." 
              rows={4}
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={sendTicket} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Ticket
          </Button>
        </div>
      )
    },
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
              <User className="h-4 w-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setActiveDialog("settings")}>
            <Settings className="mr-2 h-4 w-4" /> Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveDialog("help")}>
            <HelpCircle className="mr-2 h-4 w-4" /> Help
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveDialog("faq")}>
            <HelpCircle className="mr-2 h-4 w-4" /> FAQ
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveDialog("support")}>
            <LifeBuoy className="mr-2 h-4 w-4" /> Support
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!activeDialog} onOpenChange={(o) => !o && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {activeDialog && (
            <>
              <DialogHeader>
                <DialogTitle>{dialogs[activeDialog].title}</DialogTitle>
                <DialogDescription>{dialogs[activeDialog].desc}</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {dialogs[activeDialog].content}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
