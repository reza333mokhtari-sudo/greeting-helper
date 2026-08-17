import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface FullscreenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

/**
 * Previews and tools use fullscreen popup; real pages use routes.
 */
export function FullscreenModal({
  open,
  onOpenChange,
  children,
  title,
  className,
}: FullscreenModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-[101] flex flex-col bg-sidebar text-foreground p-6 shadow-2xl transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className,
          )}
          onPointerDownOutside={(e) => {
            // Check if we're clicking the overlay
            if (e.target === e.currentTarget) onOpenChange(false);
          }}
        >
          <div className="flex items-center justify-between mb-6 shrink-0">
            {title && (
              <DialogPrimitive.Title className="text-lg font-semibold tracking-tight">
                {title}
              </DialogPrimitive.Title>
            )}
            <DialogPrimitive.Close className="ml-auto rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-sidebar">
              <X className="size-6" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 min-h-0">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
