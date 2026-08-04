import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";

import { DungeonEditor } from "@/components/dungeon/DungeonEditor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dungeon Scrawl — Free RPG Dungeon Map Maker" },
      {
        name: "description",
        content:
          "Draw dungeon maps in your browser: rooms, corridors, doors, stairs and labels on a snapping grid. Export PNG or save your map file.",
      },
      { property: "og:title", content: "Dungeon Scrawl — Free RPG Dungeon Map Maker" },
      {
        property: "og:description",
        content: "Draw rooms, corridors, doors and stairs on a snapping grid, then export your dungeon map as PNG.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<div className="flex h-screen items-center justify-center text-sm text-muted-foreground">Loading map editor…</div>}>
      <DungeonEditor />
    </ClientOnly>
  );
}
