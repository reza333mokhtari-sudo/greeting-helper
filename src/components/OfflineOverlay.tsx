import { useEffect, useRef, useState } from "react";
import { Loader2, WifiOff } from "lucide-react";
import { toast } from "sonner";

import { useOnlineStatus } from "@/hooks/use-online-status";

/**
 * Shows a toast when the connection drops and blocks the UI with a loader
 * until the browser is back online.
 */
export function OfflineOverlay() {
  const online = useOnlineStatus();
  const [visible, setVisible] = useState(false);
  const wasOffline = useRef(false);
  const since = useRef<number | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      since.current = Date.now();
      setVisible(true);
      toast.error("You are offline", {
        id: "offline",
        description: "Your work keeps saving locally. Reconnecting…",
        duration: Infinity,
      });
      return;
    }

    toast.dismiss("offline");
    if (wasOffline.current) {
      wasOffline.current = false;
      toast.success("Back online", { description: "Cloud saving and AI are available again." });
    }
    setVisible(false);
    since.current = null;
    setSeconds(0);
  }, [online]);

  useEffect(() => {
    if (online) return;
    const t = setInterval(() => {
      if (since.current) setSeconds(Math.round((Date.now() - since.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [online]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-xl border border-border bg-card px-8 py-7 text-center shadow-lg">
        <div className="relative">
          <Loader2 className="size-8 animate-spin text-primary" />
          <WifiOff className="absolute inset-0 m-auto size-3.5 text-destructive" />
        </div>
        <p className="text-sm font-medium text-foreground">Waiting for your connection…</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          The editor is paused. Everything you drew is stored on this device and will sync once you
          are back online.
        </p>
        <p className="text-[11px] tabular-nums text-muted-foreground/70">offline for {seconds}s</p>
      </div>
    </div>
  );
}
