import { useState } from "react";
import { type Doc, type Pt } from "@/lib/dungeon/model";
import { generateRoom, type RoomTemplate } from "@/lib/dungeon/generators/procedural";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2, Plus, BoxSelect } from "lucide-react";
import { toast } from "sonner";

type Props = {
  doc: Doc;
  onCommit: (next: Doc, label: string) => void;
};

export function GeneratorPanel({ doc, onCommit }: Props) {
  const [w, setW] = useState(5);
  const [h, setH] = useState(5);
  const [name, setName] = useState("New Room");

  const handleAddRoom = () => {
    // Generate at center of current view or 0,0 for now
    const pos: Pt = { x: 0, y: 0 };
    const next = generateRoom(doc, pos, { w, h, name });
    onCommit(next, `Generate Room: ${name}`);
    toast.success(`Generated ${name} (${w}x${h})`);
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Wand2 className="h-3.5 w-3.5 text-accent" /> Procedural Generator
        </h2>
      </div>

      <div className="space-y-4 p-1">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-muted-foreground">Room Dimensions (Tiles)</Label>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <span className="text-[9px] text-muted-foreground">Width</span>
              <Input 
                type="number" 
                value={w} 
                onChange={e => setW(parseInt(e.target.value) || 1)} 
                className="h-8 text-xs"
              />
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-[9px] text-muted-foreground">Height</span>
              <Input 
                type="number" 
                value={h} 
                onChange={e => setH(parseInt(e.target.value) || 1)} 
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-muted-foreground">Room Name</Label>
          <Input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="e.g. Throne Room"
            className="h-8 text-xs"
          />
        </div>

        <Button 
          onClick={handleAddRoom} 
          className="w-full gap-2 text-xs h-9"
          variant="secondary"
        >
          <Plus className="h-3.5 w-3.5" />
          Generate Room
        </Button>

        <div className="rounded-md border border-dashed border-border p-3 bg-muted/30">
          <p className="text-[10px] text-muted-foreground leading-relaxed italic">
            Tip: Procedural generation creates base geometry that you can then refine using the standard tools.
          </p>
        </div>
      </div>
    </section>
  );
}
