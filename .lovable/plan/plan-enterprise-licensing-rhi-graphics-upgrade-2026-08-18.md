# Plan: Enterprise Licensing & RHI Graphics Upgrade

Implement admin-led license generation with flexible durations and desktop graphics optimization using Qt RHI backends.

## User Review Required

> [!IMPORTANT]
> - License generation requires the `public.licenses` table. I will verify it has the `expires_at` column.
> - RHI backend selection in the desktop app will persist using `QSettings` and require an application restart to apply.

## Proposed Changes

### Web Admin Control Center
#### [Backend] License Generation
- Update `adminGenerateLicense` in `src/lib/admin.functions.ts` to support month-based durations (1, 3, 5, 7, 9, 12, 15 months).
- Ensure `expires_at` calculation matches the requested months.

#### [Frontend] Admin UI
- Add a "Create License" button to the Licenses tab in `src/routes/admin/index.tsx`.
- Implement a dialog to select a user and a month-based duration.
- Update `AdminDataTable` to show the new actions if applicable.

### Desktop Qt Application
#### [C++] Graphics RHI Backend Selection
- Create `src/services/GraphicsManager` (or update `main.cpp`) to handle early RHI initialization.
- Call `QQuickWindow::setGraphicsApi()` before `QApplication` construction based on saved settings.
- Implement detection and persistence for OpenGL, Vulkan, Metal (macOS), and Direct3D 11 (Windows).

#### [QML] Preferences UI
- Overhaul `qml/dialogs/PreferencesDialog.qml` Graphics tab.
- Add backend selection ComboBox with options: Auto, OpenGL, Vulkan, Metal, Direct3D 11.
- Display "Active Backend" and "Restart Required" warning.
- Add a "Restart Now" button for convenience.

## Technical Details
- **License Keys**: Prefix format remains (e.g., `ENTERPRISE-XXXX`) to maintain compatibility with `LicenseService.cpp`.
- **RHI Persistence**: Settings saved under `Graphics/RHIBackend` (string).
- **Environment Override**: Support `QSG_RHI_BACKEND` as requested.
- **Admin Restriction**: Backend selection restricted to high-privilege users or Admin mode if requested (user mentioned "dungeonscrawl (default)" vs "Fusion (Admin)").

## Verification Plan
### Automated Tests
- Run `lovable-exec` to check `src/lib/admin.functions.ts` syntax.
- Mock backend selection in a test QML script to verify property binding.

### Manual Verification
- Verify the "Add License" button appears in the admin panel.
- Verify the months dropdown (1, 3, 5, 7, 9, 12, 15) generates correct expiry dates.
- Check desktop `main.cpp` logic for early RHI initialization.
