# Plan - Authentication Recovery and Sync Reliability

Fixing the account creation failures and enhancing sync visibility for both web and desktop environments.

## User Review Required

> [!IMPORTANT]
> The current "Password is weak" error was caught during debugging. Users should ensure they use unique passwords that aren't part of common leak databases.

- **Authentication Fix**: The database trigger was expecting `full_name` metadata, but the frontend was only sending `display_name`. I've updated the signup logic to include both.
- **Improved Errors**: Signup errors (like weak passwords or server failures) now show clear, actionable messages instead of empty alerts or raw API codes.
- **Sync Reliability**: Added clear status indicators to map entries to distinguish between Synced, Pending, and Error states.

## Technical Details

### Frontend (React)

- **src/routes/auth.tsx**: Updated `signUp` to include `full_name` in metadata and improved error mapping for 422 (weak password) and 500 (trigger failure) responses.
- **src/components/dungeon/MapsPanel.tsx**: Added `SyncStatus` icons and tooltips to the map list.
- **src/integrations/supabase/client.ts**: Verified proxy logic to ensure it doesn't deadlock the boot sequence if config is temporarily missing.

### Backend (Supabase)

- Verified `handle_new_user` trigger logic against incoming metadata.
- Ensured RLS policies for `profiles` and `maps` are consistent with the `authenticated` role requirements.

### Desktop (Qt/C++)

- Verified `main.cpp` uses `QApplication` for correct widget support.
- Standardized top bar height to `56px` to match web layout.
