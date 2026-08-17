# Desktop Application Enhancement & Bug Fixes

This plan fixes a critical runtime error in the admin dashboard and overhauls the Qt desktop application with a professional suite of independent windows (Welcome, Documentation, About, and License Management) including a C++ backend for license verification.

## Phase 1: Web Bug Fix
- **Repair `adminGetRows` server function**: The `query` object returned by Supabase's `from().select()` can sometimes be a `PostgrestBuilder` that hasn't fully initialized if certain middlewares or types are misaligned. More specifically, the error `query.range is not a function` usually implies `query` is a promise or a result instead of the builder. I will ensure the builder chain is correctly typed and maintained.

## Phase 2: Qt Backend (C++)
- **Create `LicenseService`**: A new C++ class to handle license validation, trial status, and local persistence via `QSettings`.
- **Update `main.cpp`**: Register the new `LicenseService` for QML usage.
- **Update `CMakeLists.txt`**: Add new source files and ensure resource prefixes are correct.

## Phase 3: Window Infrastructure (QML)
- **Create `BaseFloatingWindow.qml`**: A reusable `ApplicationWindow` base with standard dark-DCC styling, exclusive title bars, and consistent padding.
- **Implement Windows**:
    - `WelcomeWindow.qml`: Recent files, quick actions, "Don't show again".
    - `AboutWindow.qml`: Branding, versions, and tech credits.
    - `LicenseWindow.qml`: Key activation UI integrated with `LicenseService`.
    - `HelpWindow.qml`: Markdown-style documentation viewer with a navigation sidebar and search.

## Phase 4: Integration
- **Update `TopBar.qml`**: Connect "Help" menu items to open the new windows.
- **Update `Main.qml`**: Handle initial "Welcome" screen launch logic.
- **Resource Management**: Update `resources.qrc` to include all new QML files.

## Technical Details
- **License Logic**: The `LicenseService` will implement a simple hardware-ID hash (mocked) and RSA-like verification (mocked for now) to demonstrate professional architecture.
- **Window Lifetime**: Windows will be managed as singleton-like instances in QML or created dynamically to ensure `onClosing` cleanup.
- **Theming**: Dark #0A0A0A backgrounds with #3B82F6 blue accents, consistent with the "Arcane Autodesk" design system.
