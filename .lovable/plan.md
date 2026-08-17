# UI/UX Upgrade Plan: "Arcane Autodesk" Aesthetic

Inspired by the precision of Autodesk Maya/3ds Max and the dark, focused atmosphere of high-end creative tools, this plan shifts the design towards a "Dungeon Scrawl Professional" aesthetic.

## 1. Visual Language (Maya/Autodesk Style)
- **Palette**: Shift from chocolate-brown to a professional **Slate & Charcoal** core with **Cyber-Gold** and **Neon-Blue** accents.
- **Surface**: Minimalist tool panels with subtle 1px borders. High-density information display.
- **Typography**: "SF Pro Display" for headings, "JetBrains Mono" or "Inter" for data/mono elements.
- **Micro-interactions**: Precise, low-latency hover states. Animated SVGs for tool selection.

## 2. Desktop Shell (Tauri/Qt Style)
- **Frameless Experience**: Integrated title bar with custom minimize/maximize/close buttons.
- **Hardware Acceleration**: Optimized canvas rendering pipeline.
- **Persistent State**: Workspace layout memory (sidebar widths, panel positions).

## 3. SEO & Branding
- **Title**: Dungeon Scrawl — Professional 2D/3D RPG Map Engine
- **Meta**: "Create high-fidelity TTRPG maps with AI assistance. Professional-grade tools for Game Masters and Cartographers."

## 4. Implementation Steps
- Update `src/styles.css` with the new professional dark theme variables.
- Refactor `LeftRail.tsx` and `Toolbar.tsx` for higher density and precision.
- Enhance the Landing Page to reflect the "Pro Engine" branding.
- Inject a hardened "System Prompt" for the AI assistant that understands the new UI layout.

---
*Status: Ready for implementation.*
