# Architecture Update: Qt 6 Desktop Modernization

Modernize the C++ desktop wrapper to leverage Qt 6's optimized rendering, CMake best practices, and a unified include architecture.

## Visual Design
- Arcane Autodesk aesthetic (Slate/Gold/Cyber-Blue).
- Hardware-accelerated Canvas using `QQuickRhiItem` (Qt 6.7+) where possible, falling back to optimized `QQuickPaintedItem`.
- Compact, professional workspace layout mirroring the web editor.

## Technical Details

### 1. Include Architecture
- Normalize all `#include` directives to use angle brackets `<path/to/header.h>` for consistency across the codebase.
- Ensure all include paths are relative to the project root (`desktop/qt/src`).

### 2. Qt 6 Modernization
- **CMake Refactoring**: Move away from legacy `.pro` files to a modern `qt_add_qml_module` approach.
- **Rendering**: Optimize the `MapCanvasItem` to use `QPainter` over RHI for high-fidelity 2D dungeon rendering with better antialiasing and sub-pixel precision.
- **Type Registration**: Use `QML_ELEMENT` and `QML_NAMED_ELEMENT` macros for declarative type registration instead of manual `qmlRegisterType`.

### 3. File Structure
- `src/core/`: Application logic, document state, and undo/redo.
- `src/canvas/`: Rendering engine and input handling.
- `src/models/`: Asset and UI data models.
- `src/services/`: AI connectivity and file I/O.
- `qml/`: Modern QML UI components using QtQuick.Controls 6.

### 4. Implementation Steps
- Update `CMakeLists.txt` to enforce Qt 6 and modern project setup.
- Refactor C++ headers to use `QML_ELEMENT`.
- Update `main.cpp` for a cleaner initialization flow.
- Verify include normalization across all `.cpp` and `.h` files.

## Constraint & Security
- Strict memory management using Smart Pointers (`std::unique_ptr`, `QPointer`).
- Sanitize all file paths and AI prompts at the desktop boundary.
