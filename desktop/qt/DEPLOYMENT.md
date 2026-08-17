# Deployment Guide: Greeting Helper Qt Desktop

This document outlines the packaging process for Linux and Windows.

## Linux (AppImage / Standalone)

To create a portable Linux distribution:

1. Build the project:
   ```bash
   mkdir -p build && cd build
   cmake .. -DCMAKE_BUILD_TYPE=Release
   make -j$(nproc)
   ```
2. Use `linuxdeploy` with the Qt plugin:
   ```bash
   linuxdeploy-x86_64.AppImage --appdir AppDir --executable appDungeonEditor --plugin qt --output appimage
   ```

## Windows (windeployqt)

To package for Windows (requires a Windows environment with Qt 6 installed):

1. Build using MSVC or MinGW in Release mode.
2. Run `windeployqt`:
   ```powershell
   windeployqt.exe --qmldir ..\qml .\appDungeonEditor.exe
   ```
3. Bundle all generated DLLs and the `qml` directory with the executable.

## CI/CD Verification

The project includes `package_linux.py` for automated dependency verification and headless startup testing.
