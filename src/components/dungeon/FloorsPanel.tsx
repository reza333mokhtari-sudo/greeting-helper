import { useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Copy,
  Layers3,
  Link2,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

import type { Doc, FloorLinkKind } from "@/lib/dungeon/model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const LINK_KINDS: { id: FloorLinkKind; label: string }[] = [
  { id: "stairs", label: "Stairs" },
  { id: "elevator", label: "Elevator" },
  { id: "ladder", label: "Ladder" },
  { id: "hatch", label: "Hatch" },
  { id: "door", label: "Door" },
];

type Props = {
  doc: Doc;
  onSelectFloor: (id: string) => void;
  onAddFloor: (duplicate: boolean) => void;
  onRenameFloor: (id: string, name: string) => void;
  onDeleteFloor: (id: string) => void;
  onMoveFloor: (id: string, dir: -1 | 1) => void;
  onToggleUnderlay: (on: boolean) => void;
  onAddLink: (to: string, kind: FloorLinkKind, label: string) => void;
  onRemoveLink: (id: string) => void;
};

export function FloorsPanel({
  doc,
  onSelectFloor,
  onAddFloor,
  onRenameFloor,
  onDeleteFloor,
  onMoveFloor,
  onToggleUnderlay,
  onAddLink,
  onRemoveLink,
}: Props) {
  const [linkTo, setLinkTo] = useState<string>("");
  const [linkKind, setLinkKind] = useState<FloorLinkKind>("stairs");
  const [linkLabel, setLinkLabel] = useState("");

  const others = doc.floors.filter((f) => f.id !== doc.activeFloorId);
  const activeLinks = doc.links.filter((l) => l.from === doc.activeFloorId || l.to === doc.activeFloorId);
  const nameOf = (id: string) => doc.floors.find((f) => f.id === id)?.name ?? "—";

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Building2 className="h-3 w-3 text-accent" /> Floors
        </h2>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="size-6" aria-label="Duplicate floor" onClick={() => onAddFloor(true)}>
            <Copy className="size-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="size-6" aria-label="Add floor" onClick={() => onAddFloor(false)}>
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* RE4-style vertical floor stack: top of the list is the highest floor. */}
      <div className="space-y-1.5">
        {doc.floors.map((f, i) => {
          const on = f.id === doc.activeFloorId;
          return (
            <div
              key={f.id}
              className={`rounded-md border p-2 transition-colors ${
                on ? "border-accent bg-accent/10" : "border-border/60 bg-card/40 hover:border-primary/60"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onSelectFloor(f.id)}
                  className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                  aria-pressed={on}
                >
                  <Layers3 className={`size-3.5 shrink-0 ${on ? "text-accent" : "text-muted-foreground"}`} />
                  <span className="truncate text-[11px] font-medium">{f.name}</span>
                  {on && <Badge className="h-4 px-1 text-[9px]">active</Badge>}
                </button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-5"
                  aria-label="Move floor up"
                  disabled={i === 0}
                  onClick={() => onMoveFloor(f.id, -1)}
                >
                  <ChevronUp className="size-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-5"
                  aria-label="Move floor down"
                  disabled={i === doc.floors.length - 1}
                  onClick={() => onMoveFloor(f.id, 1)}
                >
                  <ChevronDown className="size-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-5"
                  aria-label="Delete floor"
                  disabled={doc.floors.length <= 1}
                  onClick={() => onDeleteFloor(f.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
              {on && (
                <div className="mt-1.5 space-y-1.5">
                  <Input
                    value={f.name}
                    onChange={(e) => onRenameFloor(f.id, e.target.value)}
                    className="h-6 text-[11px]"
                    aria-label="Floor name"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {f.shapes.length} shapes · {f.objects.length} objects · {f.fog.length} fogged
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button
        size="sm"
        variant="outline"
        className="h-7 w-full text-[11px]"
        onClick={() => onToggleUnderlay(!doc.showUnderlay)}
      >
        {doc.showUnderlay ? <Eye className="mr-1 h-3 w-3" /> : <EyeOff className="mr-1 h-3 w-3" />}
        Ghost of floor below {doc.showUnderlay ? "on" : "off"}
      </Button>

      <p className="rounded-md border border-border/50 bg-background/40 p-2 text-[10px] leading-relaxed text-muted-foreground">
        Drawing, fog and the AI cartographer only affect the selected floor.
      </p>

      <Separator />

      <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Link2 className="h-3 w-3 text-accent" /> Connections
      </h3>

      <div className="space-y-1.5">
        <Select value={linkTo} onValueChange={setLinkTo}>
          <SelectTrigger className="h-7 text-[11px]">
            <SelectValue placeholder="Connect to floor…" />
          </SelectTrigger>
          <SelectContent>
            {others.map((f) => (
              <SelectItem key={f.id} value={f.id} className="text-[11px]">
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1.5">
          <Select value={linkKind} onValueChange={(v) => setLinkKind(v as FloorLinkKind)}>
            <SelectTrigger className="h-7 flex-1 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LINK_KINDS.map((k) => (
                <SelectItem key={k.id} value={k.id} className="text-[11px]">
                  {k.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            placeholder="Label"
            className="h-7 flex-1 text-[11px]"
          />
        </div>
        <Button
          size="sm"
          className="h-7 w-full text-[11px]"
          disabled={!linkTo}
          onClick={() => {
            onAddLink(linkTo, linkKind, linkLabel.trim());
            setLinkLabel("");
            setLinkTo("");
          }}
        >
          <Plus className="mr-1 h-3 w-3" /> Connect floors
        </Button>
      </div>

      {activeLinks.length > 0 ? (
        <ul className="space-y-1">
          {activeLinks.map((l) => {
            const target = l.from === doc.activeFloorId ? l.to : l.from;
            return (
              <li key={l.id} className="flex items-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-2 py-1">
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left text-[10px]"
                  onClick={() => onSelectFloor(target)}
                  title="Go to connected floor"
                >
                  <span className="font-medium text-foreground">{l.label || LINK_KINDS.find((k) => k.id === l.kind)?.label}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — {nameOf(l.from)} → {nameOf(l.to)}
                  </span>
                </button>
                <Button size="icon" variant="ghost" className="size-5" aria-label="Remove connection" onClick={() => onRemoveLink(l.id)}>
                  <Trash2 className="size-3" />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[10px] text-muted-foreground">No connections from this floor yet.</p>
      )}
    </section>
  );
}
