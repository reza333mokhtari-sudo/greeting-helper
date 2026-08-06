import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, AlertTriangle, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dialog } from "@/lib/dialog";

/**
 * Custom interactive dialog system UI.
 */
export function AppDialog() {
  const [state, setState] = React.useState<any>(null);
  const [promptValue, setPromptValue] = React.useState("");

  React.useEffect(() => {
    return dialog.subscribe((s) => {
      setState(s);
      if (s?.type === "prompt") {
        setPromptValue(s.options.defaultValue || "");
      }
    });
  }, []);

  if (!state) return null;

  const { options, type, resolve } = state;
  const isDanger = options.variant === "danger";
  const isWarning = options.variant === "warning";
  const isSuccess = options.variant === "success";

  const handleClose = (value: any) => {
    dialog.close(value);
  };

  const Icon = isDanger || isWarning ? AlertTriangle : isSuccess ? CheckCircle2 : Info;

  return (
    <DialogPrimitive.Root open={!!state} onOpenChange={(open) => !open && handleClose(null)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm transition-all duration-300 animate-in fade-in" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[201] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-sidebar p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95",
            options.fullscreen && "inset-0 max-w-none rounded-none"
          )}
          onPointerDownOutside={(e) => {
            if (type === "custom") return; // Let custom dialogs handle their own click-outside logic if needed
            e.preventDefault();
          }}
        >
          <div className="flex items-start gap-4">
            {!options.fullscreen && (
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full",
                  isDanger ? "bg-destructive/20 text-destructive" :
                  isWarning ? "bg-amber-500/20 text-amber-500" :
                  isSuccess ? "bg-emerald-500/20 text-emerald-500" :
                  "bg-primary/20 text-primary"
                )}
              >
                <Icon className="size-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <DialogPrimitive.Title className="text-lg font-semibold tracking-tight text-foreground">
                {options.title}
              </DialogPrimitive.Title>
              {options.message && (
                <DialogPrimitive.Description className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {options.message}
                </DialogPrimitive.Description>
              )}

              {type === "prompt" && (
                <div className="mt-4">
                  <Input
                    autoFocus
                    value={promptValue}
                    onChange={(e) => setPromptValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleClose(promptValue);
                      if (e.key === "Escape") handleClose(null);
                    }}
                    className="bg-background/50"
                  />
                </div>
              )}

              {type === "custom" && options.content && (
                <div className="mt-4">{options.content}</div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                {options.cancelText && (
                  <Button variant="outline" onClick={() => handleClose(type === "confirm" ? false : null)}>
                    {options.cancelText}
                  </Button>
                )}
                <Button
                  variant={isDanger ? "destructive" : "default"}
                  onClick={() => handleClose(type === "prompt" ? promptValue : type === "confirm" ? true : true)}
                >
                  {options.confirmText || "OK"}
                </Button>
              </div>
            </div>
          </div>

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
