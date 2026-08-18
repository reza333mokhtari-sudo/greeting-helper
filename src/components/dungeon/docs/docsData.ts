export interface DocSection {
  id: string;
  title: string;
  content: string;
  category: "basics" | "tools" | "view" | "assets" | "advanced";
  keywords: string[];
}

export const DOCS_DATA: DocSection[] = [
  {
    id: "quick-start",
    category: "basics",
    title: "Quick Start (60 Seconds)",
    keywords: ["start", "begin", "tutorial", "first"],
    content: `### Your First Map in 60 Seconds
1. **Choose a Tool**: Click the **Room (R)** or **Brush (B)** tool from the toolbar.
2. **Shape the Map**: Click and drag on the canvas to carve out your dungeon.
3. **Add Props**: Open the **Props** panel (left rail) and drag a tree, rock, or boss into your map.
4. **Refine**: Right-click any object to apply filters like **Pixel** or **Toon**.
5. **Save & Export**: Your progress is auto-saved. Use **File > Export** to grab a PNG, SVG, or PDF.`,
  },
  {
    id: "navigation",
    category: "basics",
    title: "Navigation & View",
    keywords: ["pan", "zoom", "move", "canvas"],
    content: `### Moving Around
- **Pan**: Hold **Space** and drag, or use the middle mouse button.
- **Zoom**: Use your mouse wheel or the **+ / -** buttons in the view menu.
- **Minimap**: Drag the viewport rectangle in the minimap (top-right) to jump to a location.
- **Fit to Screen**: Press **F** to center your entire map.`,
  },
  {
    id: "tools",
    category: "tools",
    title: "Core Drawing Tools",
    keywords: ["draw", "room", "brush", "rect", "poly", "erase"],
    content: `### Shaping the Void
- **Room (R)**: Drag to create rectangular rooms.
- **Poly (P)**: Click to place points for custom shapes. Close the loop to finish.
- **Brush (B)**: Freehand drawing for organic caves.
- **Erase (E)**: Toggle erase mode on any tool to remove existing geometry.
- **Roughness**: Use the slider in the properties panel to give walls a hand-drawn look.`,
  },
  {
    id: "objects",
    category: "assets",
    title: "Objects & Props",
    keywords: ["prop", "item", "npc", "stamp", "3d", "place"],
    content: `### Populating the Map
- **Placement**: Drag items from the **Props** panel or click to place the selected stamp.
- **Transform**: Click an object to move, rotate, or scale it via the **Properties** panel.
- **3D Assets**: Enable **3D Mode** to place elevation-aware props. Note: The main viewport remains your 2D working surface.
- **Multi-Select**: Hold **Shift** to select multiple objects or use **Ctrl+A** to select everything.`,
  },
  {
    id: "camera",
    category: "view",
    title: "Camera & 3D Views",
    keywords: ["camera", "3d", "cube", "top", "side", "xyz"],
    content: `### Mastering the View Cube
- **View Cube**: Click faces (Top, Front, etc.) to snap the camera to standard orientations.
- **Orbit**: When Camera is enabled, right-click and drag to rotate the view.
- **Axis Guide**: 
  - **X (Red)**: Horizontal axis.
  - **Y (Green)**: Vertical axis.
  - **Z (Blue)**: Elevation/Depth.
- **Standard Views**: Instantly jump to Top, Bottom, Left, or Right perspectives.`,
  },
  {
    id: "right-click",
    category: "advanced",
    title: "Right-Click Actions",
    keywords: ["menu", "context", "filter", "toon", "pixel", "bg"],
    content: `### Pro Actions
Right-click any prop or map area for advanced options:
- **Pixelate**: Convert high-res props into retro pixel art.
- **Toon**: Apply a stylized cel-shaded outline.
- **Remove Background**: (Beta) AI-powered background removal for custom uploads.
- **Elevation**: Adjust Z-height for 3D-placed assets.`,
  },
  {
    id: "shortcuts",
    category: "basics",
    title: "Keyboard Shortcuts",
    keywords: ["keyboard", "keys", "hotkeys"],
    content: `### Work Faster
| Key | Action |
| --- | --- |
| **R / B** | Room / Brush Tool |
| **D / S** | Door / Stairs |
| **E** | Toggle Erase |
| **Ctrl+Z / Y** | Undo / Redo |
| **Ctrl+A / D** | Select All / Deselect |
| **Space** | Pan |
| **Del** | Delete Selection |`,
  },
  {
    id: "troubleshooting",
    category: "advanced",
    title: "Troubleshooting",
    keywords: ["help", "fix", "error", "stuck"],
    content: `### Common Fixes
- **Can't Pan?**: Make sure you're holding Space and not currently in a modal.
- **Minimap Desync**: Click "Fit to Screen" to recalibrate the viewport mapping.
- **3D Library Empty**: Check your internet connection; assets are loaded on demand.
- **Tools Not Working**: Ensure you're on a visible layer and not in "Player View" mode.`,
  },
  {
    id: "ai-assistant",
    category: "advanced",
    title: "AI Cartographer Assistant",
    keywords: ["ai", "help", "guide", "suggest", "chat", "automation"],
    content: `### Your Professional AI Co-Pilot
The AI Assistant is a specialized language model fine-tuned for professional dungeon design and procedural architecture.

- **Capabilities**: Ask for layout ideas, architectural history, or help with complex tool interactions.
- **Safety Lock**: The AI is strictly advisory. It cannot modify your map geometry directly without your explicit approval through a "Ghost Preview".
- **Tool Grounding**: It understands the specific constraints of the "Arcane Autodesk" engine. Ask "How do I optimize render scale?" for technical guidance.
- **Diagnostics**: Use **AI > Diagnostics** in the top menu to view the reasoning tokens and performance metrics for the current session.

**Stability Note**: The web engine is optimized for high-performance 2D rendering. If you experience performance issues, check the **Graphics Settings** panel to adjust render quality or anti-aliasing.`,
  },
  {
    id: "admin-control",
    category: "advanced",
    title: "Admin Control Center",
    keywords: ["admin", "database", "users", "security", "manage"],
    content: `### Enterprise Admin Studio
The Admin Control Center is a secure, schema-aware studio for site administrators.

- **Gatekeeper**: Access is strictly limited to verified 'admin' roles.
- **Data Explorer**: Manage all app tables (maps, profiles, assets) with a high-performance virtualized data grid.
- **Audit Logs**: Every administrative action is logged for security and transparency.
- **Safety**: Destructive operations like deletion require explicit confirmation.

To access, log in as an administrator and click **Control Center** in your profile menu.`,
  },
];
