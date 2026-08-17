# Dungeon Editor Documentation Pipeline

This help system is built using a structured data model and dynamic rendering.

## How to Update Documentation

### 1. Update Content

Documentation text is stored in `src/components/dungeon/docs/docsData.ts`.

- Edit existing sections in the `DOCS_DATA` array.
- Add new sections by creating an object with a unique `id`.
- Use standard Markdown syntax for the `content` field.

### 2. Update UI Logic

- `HelpCenter.tsx`: The main fullscreen documentation modal.
- `HelpButton.tsx`: A reusable tooltip + button that can jump to specific sections.

### 3. Adding "Learn More" Links

To add a small help icon next to a UI feature:

```tsx
import { HelpButton } from "./docs/HelpButton";
// ...
<HelpButton onClick={() => openHelp("your-section-id")} label="Feature Name" />;
```

### 4. Technical Stack

- **React Markdown**: Renders the Markdown content securely.
- **Lucide React**: Provides the iconography.
- **Shadcn UI (Dialog/ScrollArea)**: Handles the layout and accessibility.

Last Updated: August 2026
