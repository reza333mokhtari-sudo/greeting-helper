import { createFileRoute } from "@tanstack/react-router";
import { DungeonEditor } from "@/components/dungeon/DungeonEditor";

export const Route = createFileRoute("/_authenticated/editor")({
  head: () => ({
    meta: [
      { title: "Editor — Dungeon Scrawl Map Maker" },
      { name: "description", content: "Professional RPG dungeon map editor." },
    ],
  }),
  component: EditorPage,
});

function EditorPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <DungeonEditor />
    </div>
  );
}
