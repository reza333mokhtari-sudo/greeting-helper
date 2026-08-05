import { useState } from "react";
import { Link2, Copy, Check, Globe, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { MapRow } from "@/lib/cloud";

type Props = {
  row: MapRow;
  onTogglePublic: (value: boolean) => void;
};

export function ShareDialog({ row, onTogglePublic }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const viewUrl = `${window.location.origin}/m/${encodeURIComponent(row.share_slug)}`;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 text-xs">
          <Link2 className="mr-1 h-3.5 w-3.5" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            Share map
            <Badge variant={row.is_public ? "default" : "secondary"} className="text-[9px]">
              {row.is_public ? "Public" : "Private"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-card/60 p-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium">
                {row.is_public ? <Globe className="h-3.5 w-3.5 text-primary" /> : <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                {row.is_public ? "Anyone with the link can view" : "Only you can view"}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Public maps get a player-view link. Private maps are still saved to your account but cannot be opened by others.
              </p>
            </div>
            <Switch checked={row.is_public} onCheckedChange={onTogglePublic} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Player view link</Label>
            <div className="flex items-center gap-2">
              <Input value={viewUrl} readOnly className="h-8 text-xs" />
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 shrink-0"
                disabled={!row.is_public}
                onClick={() => copy(viewUrl)}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
            {!row.is_public && (
              <p className="text-[10px] text-muted-foreground">Make the map public to enable sharing.</p>
            )}
          </div>

          <div className="rounded-lg bg-muted/50 p-2.5 text-[10px] text-muted-foreground leading-relaxed">
            The shared link opens in <strong>Player View</strong> so GM-only layers, fog of war, and hidden notes stay hidden.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
