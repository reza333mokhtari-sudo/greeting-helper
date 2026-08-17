cmake_minimum_required(VERSION 3.21)

project(DungeonEditor VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Qt6 REQUIRED COMPONENTS 
    Core 
    Gui 
    Qml 
    Quick 
    Network 
    QuickControls2 
    Concurrent 
    Widgets
)

qt_standard_project_setup()

# Define the QML module and executable
qt_add_executable(appDungeonEditor
    src/main.cpp
    src/core/Document.h src/core/Document.cpp
    src/canvas/MapCanvasItem.h src/canvas/MapCanvasItem.cpp
    src/models/AssetLibraryModel.h src/models/AssetLibraryModel.cpp
    src/services/AiClient.h src/services/AiClient.cpp
    src/services/FileService.h src/services/FileService.cpp
)

# Qt 6.2+ way of handling QML modules
# We are NOT using SOURCES in qt_add_qml_module to avoid the automated 
# qmlRegisterTypes which is currently failing due to missing includes in generated code.
# Instead, we will register types manually in main.cpp.
qt_add_qml_module(appDungeonEditor NO_GENERATE_PLUGIN_SOURCE
    URI DungeonEditor
    VERSION 1.0
    RESOURCE_PREFIX "/qt/qml/DungeonEditor"
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
        qml/components/RightDock.qml
    RESOURCES
        assets/icon.png
)

target_include_directories(appDungeonEditor PRIVATE 
    ${CMAKE_CURRENT_SOURCE_DIR}/src
)

target_link_libraries(appDungeonEditor PRIVATE 
    Qt6::Core
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

