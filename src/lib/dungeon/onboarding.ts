export const ONBOARDING_STEPS = [
  {
    title:
      "now debug all model AI assist and enhance them (if CLIENT want make 2d ICON as 15px-15px(only) and other )\n\nmake sure has BIG update",
    content:
      "Dungeon Scrawl is a minimalist map maker. Everything you draw is automatically merged into a hand-drawn style.",
    image: "M3 5h18v14H3z", // Rectangle icon
  },
  {
    title: "Start Drawing",
    content:
      "The Rectangle tool (R) is selected. Drag on the canvas to create your first room. Drag from inside a room to expand it.",
    image: "M4 19c4-1 4-6 8-8s6-6 8-7c-1 4-4 7-6 9s-6 3-8 7z", // Brush icon
  },
  {
    title: "Doors & Stairs",
    content:
      "Press (D) to place doors or (S) for stairs. They auto-snap to walls and align correctly.",
    image: "M6 3h12v18H6zM14 12h1.6", // Door icon
  },
  {
    title: "The Eraser",
    content:
      "Hold (E) or press (X) to erase. Erasing near a wall creates a corridor opening, while erasing in open space removes floors.",
    image: "M3 15l8-8 8 8-4 4H7z", // Eraser icon
  },
  {
    title: "Save Your Work",
    content:
      "Free users: Use Ctrl/Cmd+S often to save .ds files. Pro users enjoy automatic cloud saving.",
    image: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z", // Save icon
  },
];

export const TOOL_DESCRIPTIONS: Record<string, { title: string; desc: string; pro?: boolean }> = {
  select: {
    title: "Select & Move",
    desc: "Pick up objects, labels, or stamps to move and rotate them.",
  },
  rect: {
    title: "Rectangle Room",
    desc: "Drag to draw box-shaped rooms. Walls merge automatically.",
  },
  brush: { title: "Corridor Brush", desc: "Paint winding paths and organic cave shapes." },
  door: {
    title: "Door Tool",
    desc: "Click on any wall to snap a door. Switch styles in the properties panel.",
  },
  stairs: {
    title: "Stairs Tool",
    desc: "Indicate level changes. Snaps to walls and aligns automatically.",
  },
  eraseRect: {
    title: "Erase Rectangle",
    desc: "Carve out sections of your map or create clean room openings.",
  },
  text: { title: "Label Tool", desc: "Add names to your rooms. Supports custom fonts and sizes." },
  fogReveal: {
    title: "Reveal Fog",
    desc: "Clear the darkness for your players. Used in 'Player View' mode.",
  },
  light: {
    title: "Light Source",
    desc: "Place torches or magical orbs. (Pro: Ray-traced shadows)",
    pro: true,
  },
};

export const WORKFLOWS = [
  {
    id: "simple",
    title: "Simple Dungeon (2 min)",
    steps: [
      "Draw 3 rooms with (R)",
      "Connect with (B) brush",
      "Add doors with (D)",
      "Export as PNG",
    ],
  },
  {
    id: "vtt",
    title: "Ready for Roll20",
    steps: ["Enable Grid (G)", "Set 70px per cell in Export", "Export as PNG", "Upload to VTT"],
  },
  {
    id: "advanced",
    title: "Multi-level Map",
    steps: [
      "Finish Ground floor",
      "Add Floor in Floors panel",
      "Enable Ghost Underlay",
      "Connect with (S) stairs",
    ],
  },
];
