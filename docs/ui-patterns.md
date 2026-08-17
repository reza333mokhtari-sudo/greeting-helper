# UI Pattern: Fullscreen Popup instead of Navigation

## Goal

To maintain user context (e.g., the canvas state) by avoiding unnecessary route changes when viewing item details, previews, or performing quick edits.

## Rules

1. **Never Navigate** for item previews or detail views that don't represent a complete shift in work context.
2. **Body Scroll Lock**: Always lock the body scroll when the modal is open.
3. **Dismissibility**: Provide three ways to close:
   - A visible **X** button (top-right).
   - The **Escape** key.
   - Clicking the dark **backdrop** (Radix/shadcn Dialog default).
4. **Z-Index**: Ensure the modal is at the top of the stack (e.g., `z-[100]`).
5. **Accessibility**: Use `role="dialog"`, `aria-modal="true"`, and maintain focus traps.

## Usage Example

```tsx
import { FullscreenModal } from "@/components/ui/FullscreenModal";

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Preview</button>

      <FullscreenModal open={open} onOpenChange={setOpen} title="Preview">
        <div className="flex items-center justify-center h-full">
          <img src="..." alt="..." />
        </div>
      </FullscreenModal>
    </>
  );
}
```

## When to use POPUP vs ROUTE

- **Use POPUP for**: Image previews, property editors, tool palettes, quick help/FAQ, AI chat/suggestions.
- **Use ROUTE for**: Auth (Sign in/up), main Dashboard, shared project links, profile settings (if large).
