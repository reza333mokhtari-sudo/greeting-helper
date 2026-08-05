import { useState } from "react";
import { User, Settings, HelpCircle, LifeBuoy, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ProfileMenu() {
  const [activeDialog, setActiveDialog] = useState<"settings" | "help" | "faq" | "support" | null>(null);

  const dialogs = {
    settings: { title: "Settings", desc: "Manage your account preferences." },
    help: { title: "Help", desc: "View documentation and guides." },
    faq: { title: "FAQ", desc: "Commonly asked questions." },
    support: { title: "Support", desc: "Get in touch with our team." },
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
        <DialogContent>
          {activeDialog && (
            <>
              <DialogHeader>
                <DialogTitle>{dialogs[activeDialog].title}</DialogTitle>
                <DialogDescription>{dialogs[activeDialog].desc}</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {/* Content based on dialog type could be added here */}
                <p className="text-sm text-muted-foreground">Dialog for {activeDialog} is currently placeholder.</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
