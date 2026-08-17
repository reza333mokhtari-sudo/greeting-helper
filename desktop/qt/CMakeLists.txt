cmake_minimum_required(VERSION 3.16)

project(DungeonEditor VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Qt6 REQUIRED COMPONENTS Core Gui Qml Quick Network QuickControls2 Concurrent Widgets)

qt_standard_project_setup()

qt_add_executable(appDungeonEditor
    src/main.cpp
    src/core/Document.h src/core/Document.cpp
    src/canvas/MapCanvasItem.h src/canvas/MapCanvasItem.cpp
    src/models/AssetLibraryModel.h src/models/AssetLibraryModel.cpp
    src/services/AiClient.h src/services/AiClient.cpp
    src/services/FileService.h src/services/FileService.cpp
)

# QML Module with proper prefixing for QRC
qt_add_qml_module(appDungeonEditor
    URI DungeonEditor
    VERSION 1.0
    RESOURCE_PREFIX "/DungeonEditor"
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
        qml/components/CmsPanel.qml
)

target_link_libraries(appDungeonEditor PRIVATE 
    Qt6::Gui 
    Qt6::Qml 
    Qt6::Quick 
    Qt6::Network
    Qt6::QuickControls2
    Qt6::Concurrent
    Qt6::Widgets
)

# Install rules
install(TARGETS appDungeonEditor
    BUNDLE DESTINATION .
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)
