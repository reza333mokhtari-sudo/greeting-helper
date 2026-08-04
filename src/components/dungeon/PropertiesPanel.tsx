import type { Doc, MapObject, TriggerKind } from "@/lib/dungeon/model";

type Props = {
  doc: Doc;
  object: MapObject | null;
  onChange: (id: string, patch: Partial<MapObject>) => void;
  onDelete: (id: string) => void;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-2 py-1 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="flex min-w-0 items-center gap-2">{children}</span>
    </label>
  );
}

const input = "w-32 min-w-0 rounded border border-border bg-background px-2 py-1 text-xs";

export function PropertiesPanel({ doc, object: o, onChange, onDelete }: Props) {
  if (!o) {
    return (
      <section>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Properties</h2>
        <p className="text-xs text-muted-foreground">Select an object to edit its properties.</p>
      </section>
    );
  }
  const patch = (v: Partial<MapObject>) => onChange(o.id, v);
  const props = o.props ?? [];
  const setProp = (i: number, key: string, value: string) =>
    patch({ props: props.map((p, j) => (j === i ? { key, value } : p)) } as Partial<MapObject>);

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Properties · {o.kind}
        </h2>
        <button onClick={() => onDelete(o.id)} className="text-xs text-destructive hover:underline">
          Delete
        </button>
      </div>

      <Row label="Name">
        <input className={input} value={o.name ?? ""} onChange={(e) => patch({ name: e.target.value })} placeholder="Unnamed" />
      </Row>
      <Row label="Layer">
        <select className={input} value={o.layerId} onChange={(e) => patch({ layerId: e.target.value })}>
          {doc.layers.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </Row>
      <Row label="X">
        <input type="number" className={input} value={Math.round(o.x)} onChange={(e) => patch({ x: Number(e.target.value) })} />
      </Row>
      <Row label="Y">
        <input type="number" className={input} value={Math.round(o.y)} onChange={(e) => patch({ y: Number(e.target.value) })} />
      </Row>

      {(o.kind === "door" || o.kind === "stairs") && (
        <Row label="Rotation°">
          <input
            type="number"
            className={input}
            value={Math.round((o.angle * 180) / Math.PI)}
            onChange={(e) => patch({ angle: (Number(e.target.value) * Math.PI) / 180 } as Partial<MapObject>)}
          />
        </Row>
      )}
      {o.kind === "door" && (
        <>
          <Row label="Variant">
            <select className={input} value={o.variant} onChange={(e) => patch({ variant: e.target.value } as Partial<MapObject>)}>
              <option value="door">Door</option>
              <option value="double">Double</option>
              <option value="secret">Secret</option>
              <option value="archway">Archway</option>
            </select>
          </Row>
          <Row label="Blocks light">
            <input
              type="checkbox"
              className="accent-primary"
              checked={!!o.blocksLight}
              onChange={(e) => patch({ blocksLight: e.target.checked } as Partial<MapObject>)}
            />
          </Row>
        </>
      )}
      {o.kind === "npc" && (
        <>
          <Row label="Label">
            <input className={input} value={o.label} onChange={(e) => patch({ label: e.target.value } as Partial<MapObject>)} />
          </Row>
          <Row label="Token size">
            <input type="range" min={6} max={64} value={o.r} onChange={(e) => patch({ r: Number(e.target.value) } as Partial<MapObject>)} className="w-28 accent-primary" />
          </Row>
          <Row label="Colour">
            <input type="color" value={o.color} onChange={(e) => patch({ color: e.target.value } as Partial<MapObject>)} className="h-6 w-10 rounded border border-border bg-transparent p-0" />
          </Row>
          <Row label="Hostile">
            <input type="checkbox" className="accent-primary" checked={o.hostile} onChange={(e) => patch({ hostile: e.target.checked } as Partial<MapObject>)} />
          </Row>
        </>
      )}
      {o.kind === "item" && (
        <>
          <Row label="Label">
            <input className={input} value={o.label} onChange={(e) => patch({ label: e.target.value } as Partial<MapObject>)} />
          </Row>
          <Row label="Size">
            <input type="range" min={8} max={64} value={o.size} onChange={(e) => patch({ size: Number(e.target.value) } as Partial<MapObject>)} className="w-28 accent-primary" />
          </Row>
          <Row label="Colour">
            <input type="color" value={o.color} onChange={(e) => patch({ color: e.target.value } as Partial<MapObject>)} className="h-6 w-10 rounded border border-border bg-transparent p-0" />
          </Row>
        </>
      )}
      {o.kind === "trigger" && (
        <>
          <Row label="Label">
            <input className={input} value={o.label} onChange={(e) => patch({ label: e.target.value } as Partial<MapObject>)} />
          </Row>
          <Row label="Type">
            <select className={input} value={o.trigger} onChange={(e) => patch({ trigger: e.target.value as TriggerKind } as Partial<MapObject>)}>
              <option value="trap">Trap</option>
              <option value="encounter">Encounter</option>
              <option value="script">Script</option>
              <option value="portal">Portal</option>
              <option value="note">Note</option>
            </select>
          </Row>
          <Row label="Width">
            <input type="number" className={input} value={Math.round(o.w)} onChange={(e) => patch({ w: Number(e.target.value) } as Partial<MapObject>)} />
          </Row>
          <Row label="Height">
            <input type="number" className={input} value={Math.round(o.h)} onChange={(e) => patch({ h: Number(e.target.value) } as Partial<MapObject>)} />
          </Row>
          <Row label="Colour">
            <input type="color" value={o.color} onChange={(e) => patch({ color: e.target.value } as Partial<MapObject>)} className="h-6 w-10 rounded border border-border bg-transparent p-0" />
          </Row>
        </>
      )}
      {o.kind === "light" && (
        <>
          <Row label="Radius">
            <input type="range" min={20} max={800} value={o.radius} onChange={(e) => patch({ radius: Number(e.target.value) } as Partial<MapObject>)} className="w-28 accent-primary" />
          </Row>
          <Row label="Intensity">
            <input type="range" min={5} max={100} value={Math.round(o.intensity * 100)} onChange={(e) => patch({ intensity: Number(e.target.value) / 100 } as Partial<MapObject>)} className="w-28 accent-primary" />
          </Row>
          <Row label="Colour">
            <input type="color" value={o.color} onChange={(e) => patch({ color: e.target.value } as Partial<MapObject>)} className="h-6 w-10 rounded border border-border bg-transparent p-0" />
          </Row>
        </>
      )}
      {o.kind === "text" && (
        <>
          <Row label="Text">
            <input className={input} value={o.text} onChange={(e) => patch({ text: e.target.value } as Partial<MapObject>)} />
          </Row>
          <Row label="Font size">
            <input type="range" min={8} max={96} value={o.size} onChange={(e) => patch({ size: Number(e.target.value) } as Partial<MapObject>)} className="w-28 accent-primary" />
          </Row>
        </>
      )}
      {o.kind === "pillar" && (
        <Row label="Radius">
          <input type="range" min={2} max={48} value={o.r} onChange={(e) => patch({ r: Number(e.target.value) } as Partial<MapObject>)} className="w-28 accent-primary" />
        </Row>
      )}
      {o.kind === "stairs" && (
        <>
          <Row label="Size">
            <input type="range" min={16} max={200} value={o.size} onChange={(e) => patch({ size: Number(e.target.value) } as Partial<MapObject>)} className="w-28 accent-primary" />
          </Row>
          <Row label="Steps">
            <input type="range" min={2} max={20} value={o.steps} onChange={(e) => patch({ steps: Number(e.target.value) } as Partial<MapObject>)} className="w-28 accent-primary" />
          </Row>
        </>
      )}

      <label className="mt-2 block text-xs text-muted-foreground">
        Notes
        <textarea
          value={o.notes ?? ""}
          onChange={(e) => patch({ notes: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
          placeholder="GM notes, stat block, loot…"
        />
      </label>

      <div className="mt-2">
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Custom fields</span>
          <button
            onClick={() => patch({ props: [...props, { key: "", value: "" }] } as Partial<MapObject>)}
            className="rounded border border-border px-1.5 hover:bg-accent"
          >
            +
          </button>
        </div>
        {props.map((pr, i) => (
          <div key={i} className="mb-1 flex gap-1">
            <input value={pr.key} placeholder="key" onChange={(e) => setProp(i, e.target.value, pr.value)} className="w-1/2 rounded border border-border bg-background px-1.5 py-1 text-[11px]" />
            <input value={pr.value} placeholder="value" onChange={(e) => setProp(i, pr.key, e.target.value)} className="w-1/2 rounded border border-border bg-background px-1.5 py-1 text-[11px]" />
            <button
              onClick={() => patch({ props: props.filter((_, j) => j !== i) } as Partial<MapObject>)}
              className="px-1 text-destructive"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
