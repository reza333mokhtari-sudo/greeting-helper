# Plan: Landing Page & Top Menu Enhancement

Enhance the landing page to show map libraries for logged-in users and update the TopMenuBar to show user avatars/profile menus instead of a generic "Sign In" button, while maintaining the **Arcane Autodesk** aesthetic.

## User Review Required

> [!IMPORTANT]
> - This plan modifies the landing page to act as a dashboard for authenticated users.
> - "Sign In" buttons on the landing page and editor top bar will be replaced by user avatars/profile menus once logged in.

## Proposed Changes

### Landing Page (`src/routes/index.tsx`)
- **Dashboard View**: Update the landing page to detect if a user is logged in. If so, display a "Recent Maps" section showing the top 4 maps (local and cloud).
- **CTA Actions**: Add a "Create New Map" button for logged-in users.
- **Visuals**: Maintain the professional DCC aesthetic with high-fidelity badges and clean typography.

### Top Menu Bar (`src/components/dungeon/TopMenuBar.tsx`)
- **Avatar Integration**: Ensure the `ProfileMenu` (which handles avatars) is correctly displayed when the user is logged in.
- **Navigation Logic**: Update the logo link to navigate to `/editor` if logged in, and `/` if not.
- **UI Consistency**: Ensure the "Launch Editor" button is always present or contextually appropriate.

### Documentation Data (`src/components/dungeon/docs/docsData.ts`)
- **Help Content**: Verify all "Learn More" links and help sections correctly reflect current tool capabilities.

## Technical Details
- Use `supabase.auth.getSession()` and `onAuthStateChange` to track auth status.
- Use `listLocalMaps` and `listCloudMaps` from `@/lib/dungeon/storage` to populate the map grid.
- Apply Tailwind v4 theme tokens (`primary`, `border`, `bg-background`) for consistent styling.
- All SVG icons will use `lucide-react`.

## Verification Plan
- **Manual Verification**: Log in as a user and verify the landing page shows a map grid.
- **Manual Verification**: Log out and verify the landing page shows the marketing hero section.
- **Manual Verification**: Check the `TopMenuBar` in the editor to ensure the user avatar/profile menu appears correctly.
