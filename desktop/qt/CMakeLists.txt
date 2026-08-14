cmake_minimum_required(VERSION 3.16)

project(DungeonEditor VERSION 0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Qt6 REQUIRED COMPONENTS Core Gui Qml Quick WebEngineQuick WebEngineCore)

qt_standard_project_setup()

qt_add_executable(appDungeonEditor
    src/main.cpp
    src/core/Document.h src/core/Document.cpp
    src/canvas/MapCanvasItem.h src/canvas/MapCanvasItem.cpp
    src/models/AssetLibraryModel.h src/models/AssetLibraryModel.cpp
    src/services/FileService.h src/services/FileService.cpp
    src/services/AiClient.h src/services/AiClient.cpp
)

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
        qml/components/StatusBar.qml
    RESOURCES
        resources.qrc
)

# Optional: Soulslike assets
# qt_add_resources(appDungeonEditor "assets"
#    PREFIX "/assets"
#    FILES assets/soulslike/manifest.json
# )

target_link_libraries(appDungeonEditor PRIVATE
    Qt6::Core
    Qt6::Gui
    Qt6::Qml
    Qt6::Quick
    Qt6::WebEngineQuick
    Qt6::WebEngineCore
)

include(FeatureSummary)
feature_summary(WHAT ALL INCLUDE_QUIET_PACKAGES FATAL_ON_MISSING_REQUIRED_PACKAGES)
