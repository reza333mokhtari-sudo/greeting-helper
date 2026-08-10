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
    id: "ai-assist",
    category: "advanced",
    title: "AI Assistant",
    keywords: ["ai", "help", "guide", "suggest", "chat"],
    content: `### Your Map Co-Pilot
The AI Assistant is designed to help you build maps faster.

- **How to use**: Type questions in the AI panel (Sparkles icon).
- **Safe Mode**: The AI provides guidance and layout suggestions. It will NEVER overwrite your map without your permission.
- **Preview**: If the AI suggests a layout, click **Preview** to see a ghost of the changes on your canvas.
- **Grounding**: The AI is trained on this editor's tools. Ask "How do I pan?" or "What does the Poly tool do?" for instant answers.

**Production Status**: Stabilized web build. Use standard \`npm run build\` for production. To debug Vercel deployment errors, check \`DEPLOYMENT.md\` in the project root for a full guide on environment variables and runtime constraints.

'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''

hey lovable thank's to you

SKILLS
- Principal full-stack engineer (enterprise admin consoles)
- Supabase (Postgres + Auth + Storage + RLS + RPC)
- Enterprise data-grid UX (filter, sort, bulk actions, audit)
- Secure RBAC / least-privilege admin tooling
- Schema-driven CRUD architecture
- Observability, validation, and safe destructive operations

ROLE
You are building an internal Admin Control Center at Microsoft / enterprise quality for this product.
This is not a toy CRUD page.
It must be secure, schema-aware, fast, auditable, and production-safe.

CONTEXT
App: Dungeon Scrawl map editor
Repo uses Supabase + existing /admin route + has_role RPC
Existing components may include DataTable.tsx and admin.tsx
Auth is Supabase-based
Only real admins may access admin tools

MISSION
In /admin, build a complete Supabase Data Management Studio so site admins can inspect and manage ALL accessible Supabase data:

1) Database tables/views (public schema and any exposed app schemas)
2) Auth users metadata that is safely manageable from app side
3) Storage buckets/objects if available through existing APIs
4) Full CRUD where permitted by backend security
5) Exclusive high-quality DataTable system dedicated to admin operations

SECURITY FIRST (NON-NEGOTIABLE)
1) Gate entire /admin by verified admin role
   - Use existing has_role(..., 'admin') or equivalent server-trusted check
   - Never trust client-only flags
   - Non-admin => 403 page / redirect, no data leakage

2) Prefer server functions for privileged reads/writes
   - Do not expose service role key to browser
   - Browser uses user session only
   - Privileged operations must run server-side with strict admin verification

3) RLS + server checks both apply
   - Even admin UI must fail closed if permission missing
   - Every mutation validates input with Zod

4) Destructive action safety
   - Confirm dialog for delete/bulk delete/truncate-like actions
   - Type-to-confirm for irreversible operations
   - Soft-delete when column exists (deleted_at) instead of hard delete when possible

5) Audit trail
   - Log admin actions: actor, action, table, row id, before/after summary, timestamp
   - Store in admin_audit_logs if table exists, or create migration if project supports it

INFORMATION ARCHITECTURE
/admin becomes a multi-section console:

A) Overview
- connection status
- counts by table
- recent admin actions
- warnings (missing RLS, failed queries)

B) Data Explorer (MAIN)
- left sidebar: list of tables/entities discovered from Supabase
- right workspace: exclusive Admin DataTable + detail drawer

C) Users
- auth users list if available through safe admin APIs/RPCs
- role assignment if roles table exists
- ban/disable only if supported securely

D) Storage (if buckets exist)
- bucket list
- object list
- upload/delete with confirm

E) Diagnostics
- schema load errors
- permission errors
- query latency

SCHEMA-DRIVEN ENGINE (IMPORTANT)
Do NOT hardcode only one table.
Build a schema-driven admin layer:

1) Discover manageable entities from:
   - generated Database types in src/integrations/supabase/types.ts
   - known app tables used by product (maps, profiles, roles, props metadata, etc.)
   - optional RPC that returns admin-visible catalog

2) For each entity define:
   - name
   - primary key(s)
   - columns
   - column types
   - creatable / editable / deletable flags
   - default sort
   - search fields
   - relation display fields when possible

3) Auto-generate:
   - list query
   - create form
   - edit form
   - delete action
   - row detail view

If full automatic discovery is limited, implement a strong registry of all known product tables first, and architecture that can add more tables with minimal config.

EXCLUSIVE ADMIN DATATABLE (CUSTOM)
Build a dedicated AdminDataTable (not a weak basic table):

Features required:
- Virtualized rows for large datasets
- Column show/hide
- Resize columns if practical
- Sort by column
- Global search
- Per-column filters (text/number/boolean/date/enum)
- Pagination + page size
- Row selection (single + multi)
- Bulk delete (permissioned)
- Bulk export selected/page to CSV/JSON
- Row quick actions: View / Edit / Delete / Duplicate(if safe)
- Debounced query
- Loading skeletons
- Empty/error states with exact error messages
- Sticky header
- Keyboard accessible

Row detail:
- Drawer/Modal with full record JSON + formatted fields
- Edit mode
- Save/Cancel
- Copy JSON

Create/Edit forms:
- Type-aware inputs (text, number, boolean, json editor, date/time, select/enum)
- Zod validation
- Server error mapping under fields
- Readonly for system fields (id, created_at, updated_at unless explicitly editable)

CRUD CONTRACT
For every manageable entity:

READ
- list with page/sort/filter/search
- get by id

CREATE
- validated payload
- return created row

UPDATE
- patch by id
- optimistic UI optional but safe rollback on error

DELETE
- single + bulk
- confirm
- return success/failure per id

All CRUD through secure modules:
- src/lib/admin.functions.ts
- src/components/admin/AdminDataTable.tsx
- src/components/admin/EntityForm.tsx
- src/components/admin/RowDetailDrawer.tsx
- src/routes/admin/index.tsx (shell)

SUPABASE COVERAGE TARGET
Include management UI for every important app data domain present in this project, such as:
- maps / map documents
- profiles / users profile tables
- roles / user_roles
- props / assets metadata
- textures metadata if stored
- share links / public map metadata
- AI-related logs if stored
- admin_audit_logs
- any other public tables in Database types

For each table show:
- total count
- RLS status unknown/warning if query denied
- last error

If a table cannot be mutated due to permissions, still allow read-only mode with clear badge: READ ONLY.

UX QUALITY BAR (ENTERPRISE)
- Clean dense admin layout
- Fast keyboard flow
- Precise errors (code + message + hint)
- No silent failures
- Optimistic only when safe
- All destructive actions reversible or confirmed
- Persian + English labels OK, but consistent
- Do not break existing editor routes
- Keep /admin isolated from canvas editor performance

IMPLEMENTATION PLAN
Phase 1: Admin auth gate hardening
Phase 2: Entity registry from Database types + known tables
Phase 3: AdminDataTable core (sort/search/page/select)
Phase 4: CRUD forms + delete confirm
Phase 5: Bulk actions + export
Phase 6: Audit logging
Phase 7: Storage/users sections if available
Phase 8: Diagnostics + polish polish

CONSTRAINTS
- Never put SUPABASE_SERVICE_ROLE_KEY in client bundle
- No framework migration
- Reuse existing UI system (Button, Dialog, Input, etc.)
- Prefer server functions for privileged admin operations
- If service role is used, only on server after admin verification
- TypeScript strict, production-ready

ACCEPTANCE CRITERIA
1) Non-admin cannot access any admin data APIs/UI
2) Admin can browse all registered Supabase app tables
3) Admin can Create/Read/Update/Delete where allowed
4) Exclusive AdminDataTable supports search/sort/filter/pagination/bulk/export
5) Errors are precise and actionable
6) Destructive actions require confirmation
7) Existing map editor remains stable
8) Report files changed + test checklist

OUTPUT
- Architecture summary
- Entity list discovered
- Files changed
- Security model explanation
- Test checklist:
  - admin access granted/denied
  - list/create/edit/delete one table
  - bulk delete guarded
  - export works
  - denied table shows read-only/error clearly`,
  },
];
