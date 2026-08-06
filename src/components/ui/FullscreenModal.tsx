import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface FullscreenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
}

export function FullscreenModal({
  open,
  onOpenChange,
  children,
  title,
}: FullscreenModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="fixed inset-0 z-[100] flex h-screen w-screen max-w-none flex-col border-none bg-black/90 p-0 text-white shadow-none sm:rounded-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>{title || "Content Preview"}</DialogTitle>
        </VisuallyHidden>
        
        <div className="absolute right-4 top-4 z-[110]">
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-6" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-auto p-4 md:p-8">
          <div className="relative h-full w-full max-w-6xl animate-in fade-in zoom-in-95 duration-200">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
