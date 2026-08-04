import type { GridStyle, Settings } from "@/lib/dungeon/model";
import { THEMES } from "@/lib/dungeon/model";

type Props = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  brushWidth: number;
  onBrushWidth: (v: number) => void;
  doorVariant: string;
  onDoorVariant: (v: string) => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onClear: () => void;
  onFit: () => void;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">{children}</span>
    </label>
  );
}

function Color({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-6 w-10 cursor-pointer rounded border border-border bg-transparent p-0"
    />
  );
}

export function SidePanel(props: Props) {
  const { settings: s, onChange } = props;
  return (
    <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-card p-4">
      <section>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Grid</h2>
        <Row label="Size">
          <input
            type="range"
            min={8}
            max={128}
            step={2}
            value={s.gridSize}
            onChange={(e) => onChange({ gridSize: Number(e.target.value) })}
            className="w-24 accent-primary"
          />
          <span className="w-7 text-right tabular-nums">{s.gridSize}</span>
        </Row>
        <Row label="Style">
          <select
            value={s.gridStyle}
            onChange={(e) => onChange({ gridStyle: e.target.value as GridStyle })}
            className="rounded border border-border bg-background px-2 py-1"
          >
            <option value="square">Square</option>
            <option value="dot">Dots</option>
            <option value="none">None</option>
          </select>
        </Row>
        <Row label="Snap to grid">
          <input type="checkbox" checked={s.snap} onChange={(e) => onChange({ snap: e.target.checked })} className="accent-primary" />
        </Row>
      </section>

      <section>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Walls</h2>
        <Row label="Thickness">
          <input
            type="range"
            min={1}
            max={24}
            value={s.wallThickness}
            onChange={(e) => onChange({ wallThickness: Number(e.target.value) })}
            className="w-24 accent-primary"
          />
          <span className="w-7 text-right tabular-nums">{s.wallThickness}</span>
        </Row>
        <Row label="Drop shadow">
          <input type="checkbox" checked={s.shadow} onChange={(e) => onChange({ shadow: e.target.checked })} className="accent-primary" />
        </Row>
        <Row label="Brush width">
          <input
            type="range"
            min={8}
            max={160}
            value={props.brushWidth}
            onChange={(e) => props.onBrushWidth(Number(e.target.value))}
            className="w-24 accent-primary"
          />
          <span className="w-7 text-right tabular-nums">{props.brushWidth}</span>
        </Row>
        <Row label="Door type">
          <select
            value={props.doorVariant}
            onChange={(e) => props.onDoorVariant(e.target.value)}
            className="rounded border border-border bg-background px-2 py-1"
          >
            <option value="door">Door</option>
            <option value="double">Double</option>
            <option value="secret">Secret</option>
            <option value="archway">Archway</option>
          </select>
        </Row>
      </section>

      <section>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Theme</h2>
        <div className="mb-2 grid grid-cols-2 gap-2">
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => onChange(t as Partial<Settings>)}
              className="rounded border border-border px-2 py-1 text-[11px] hover:bg-accent"
            >
              {t.label}
            </button>
          ))}
        </div>
        <Row label="Background">
          <Color value={s.bgColor} onChange={(v) => onChange({ bgColor: v })} />
        </Row>
        <Row label="Floor">
          <Color value={s.floorColor} onChange={(v) => onChange({ floorColor: v })} />
        </Row>
        <Row label="Wall">
          <Color value={s.wallColor} onChange={(v) => onChange({ wallColor: v })} />
        </Row>
        <Row label="Grid">
          <Color value={s.gridColor} onChange={(v) => onChange({ gridColor: v })} />
        </Row>
        <Row label="Ink / text">
          <Color value={s.inkColor} onChange={(v) => onChange({ inkColor: v })} />
        </Row>
      </section>

      <section className="mt-auto flex flex-col gap-2">
        <button onClick={props.onFit} className="rounded border border-border px-3 py-2 text-xs hover:bg-accent">
          Fit map to screen
        </button>
        <button onClick={props.onExportPng} className="rounded bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          Export PNG
        </button>
        <button onClick={props.onExportJson} className="rounded border border-border px-3 py-2 text-xs hover:bg-accent">
          Save .json
        </button>
        <label className="cursor-pointer rounded border border-border px-3 py-2 text-center text-xs hover:bg-accent">
          Load .json
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) props.onImportJson(f);
              e.target.value = "";
            }}
          />
        </label>
        <button onClick={props.onClear} className="rounded border border-destructive/50 px-3 py-2 text-xs text-destructive hover:bg-destructive/10">
          Clear map
        </button>
      </section>
    </aside>
  );
}
