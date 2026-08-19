# Desktop Engine: DLL Architecture & Local Setup

This project uses a **Bundled Binary Architecture** for the desktop application. The core engine, UI resources, and business logic are packaged into a shared library (`core.dll` or `libcore.so`), while the main executable acts as a thin wrapper.

## Architecture Overview

- **Core Library (`core`)**: 
  - Located in `desktop/qt/src/`.
  - Contains all C++ models, services, and the QML rendering engine.
  - Bundles all QML files and assets using `qt_add_resources`.
- **Thin Wrapper (`appDungeonEditor`)**:
  - Located in `desktop/qt/main.cpp`.
  - Initializes the Qt application, sets the graphics API, and links to the core library.

## Prerequisites

- **Qt 6.7+** (with QML, Quick, and WebEngine components)
- **CMake 3.21+**
- **C++20 Compiler** (MSVC 2022, GCC 11+, or Clang 14+)

## Building the Desktop Engine

1.  **Navigate to the Qt directory**:
    ```bash
    cd desktop/qt
    ```

2.  **Configure the project**:
    ```bash
    mkdir build && cd build
    cmake .. -DCMAKE_BUILD_TYPE=Release
    ```

3.  **Build the core and executable**:
    ```bash
    cmake --build . --parallel
    ```

## Running Locally

### Development Mode (Vite Bridge)
By default, the desktop app attempts to connect to a running Vite dev server at `http://localhost:8080`.

1.  **Start the web dev server**:
    ```bash
    bun run dev
    ```
2.  **Launch the desktop executable**:
    - **Windows**: `./appDungeonEditor.exe` (Ensure `core.dll` is in the same folder or system PATH)
    - **Linux**: `./appDungeonEditor`

### Production Mode (Bundled)
For standalone distribution, the app uses the bundled QML resources indexed at `qrc:/qt/qml/DungeonEditor/qml/Main.qml`.

## Graphics Backend Selection
The application supports manual selection of graphics APIs to ensure compatibility across different hardware. This can be configured via the "Graphics Backend" menu in the application (requires restart) or via `QSettings`.

- **Windows**: Defaults to D3D11 or OpenGL.
- **macOS**: Defaults to Metal.
- **Linux**: Defaults to OpenGL or Vulkan.

## Troubleshooting
- **Missing DLLs**: If the app fails to start on Windows, run `windeployqt appDungeonEditor.exe` to gather required Qt dependencies.
- **Resource Loading**: Ensure `resources.qrc` is updated if adding new SVG icons or QML components.
