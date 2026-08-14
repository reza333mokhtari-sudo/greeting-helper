cmake_minimum_required(VERSION 3.16)

project(DungeonEditor VERSION 0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Qt6 REQUIRED COMPONENTS Gui Qml Quick Network QuickControls2)

qt_standard_project_setup()

qt_add_executable(appDungeonEditor
    src/main.cpp
    src/core/Document.h src/core/Document.cpp
    src/canvas/MapCanvasItem.h src/canvas/MapCanvasItem.cpp
    src/models/AssetLibraryModel.h src/models/AssetLibraryModel.cpp
    src/services/AiClient.h src/services/AiClient.cpp
    src/services/FileService.h src/services/FileService.cpp
)

# Bundle QML files with prefix DungeonEditor
qt_add_qml_module(appDungeonEditor
    URI DungeonEditor
    VERSION 1.0
    QML_FILES
        qml/Main.qml
        qml/components/TopBar.qml
        qml/components/ToolRail.qml
        qml/components/AssetLibrary.qml
        qml/components/AiPanel.qml
        qml/components/InspectorPanel.qml
        qml/components/LayersPanel.qml
        qml/components/StatusBar.qml
        qml/components/ObjectsPanel.qml
        qml/components/SettingsPanel.qml
        qml/components/RightDock.qml
)

target_link_libraries(appDungeonEditor PRIVATE 
    Qt6::Gui 
    Qt6::Qml 
    Qt6::Quick 
    Qt6::Network
    Qt6::QuickControls2
)
