# Dungeon Editor Desktop (Qt)

Native C++/Qt port of the Dungeon Scrawl editor.

## Requirements
- Qt 6.5+ (Core, Gui, Qml, Quick, WebEngineQuick)
- CMake 3.16+
- C++17 Compiler

## Build Instructions
1. Open `desktop/qt/CMakeLists.txt` in **Qt Creator**.
2. Select a Desktop kit (e.g., Qt 6.5.x for MSVC/GCC/Clang).
3. Build and Run.

## Project Structure
- `src/core/Document.h/cpp`: C++ map model and serialization.
- `src/canvas/MapCanvasItem.h/cpp`: Hardware-accelerated 2D canvas with drawing/panning/zooming.
- `src/models/AssetLibraryModel.h/cpp`: List model for prop management.
- `src/services/`: AI network client and File I/O.
- `qml/`: Modern UI layout using Qt Quick Controls 2.

## Key Features
- **Native Canvas**: Fast rendering of room geometry and props.
- **Asset Library**: Integrated Soulslike starter pack.
- **AI Assistant**: Desktop-native interface for map generation advice.
- **Cross-Platform**: Compiles for Windows, macOS, and Linux.

## Known Gaps
- Fog of War rendering (planned for Phase 9).
- Full Undo/Redo history (QUndoStack integration in progress).
- Web GL viewport integration (requires local proxy for Vite dev assets).

'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''