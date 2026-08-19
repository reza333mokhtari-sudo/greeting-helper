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

# Define the executable
qt_add_executable(appDungeonEditor
    src/main.cpp
    src/core/Document.h src/core/Document.cpp
    src/canvas/MapCanvasItem.h src/canvas/MapCanvasItem.cpp
    src/models/AssetLibraryModel.h src/models/AssetLibraryModel.cpp
    src/services/AiClient.h src/services/AiClient.cpp
    src/services/FileService.h src/services/FileService.cpp
    src/services/WorkspaceService.h src/services/WorkspaceService.cpp
    src/services/LicenseService.h src/services/LicenseService.cpp
)



# Manual resource handling instead of qt_add_qml_module to avoid broken type registration
qt_add_resources(appDungeonEditor "qml_resources"
    PREFIX "/qt/qml/DungeonEditor"

    FILES
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
        qml/components/FogTools.qml
        qml/components/RightDock.qml
        qml/components/ZBrushButton.qml
        qml/components/ZBrushLabel.qml
        qml/components/ZBrushPanel.qml
        qml/components/ZBrushTextField.qml


        qml/components/AdvancedStatusBar.qml
        qml/components/AppIcon.qml
        qml/components/MayaShelf.qml
        qml/components/MayaToolBox.qml
        qml/panels/AssetBrowser.qml
        qml/dialogs/BaseFloatingWindow.qml
        qml/dialogs/WelcomeWindow.qml
        qml/dialogs/AboutWindow.qml
        qml/dialogs/LicenseWindow.qml
        qml/dialogs/HelpWindow.qml
        qml/dialogs/PreferencesDialog.qml
        assets/icon.png
        assets/icons/tools/select.svg
        assets/icons/tools/move.svg
        assets/icons/tools/texture_brush.svg
        assets/icons/tools/draw_corridor.svg
        assets/icons/tools/measure.svg
        assets/icons/tools/place_prop.svg
        assets/icons/tools/eraser.svg
        assets/icons/tools/procedural.svg
        assets/icons/tools/draw_room.svg
        assets/icons/tools/fog_brush.svg
        assets/icons/tools/grid.svg
        assets/icons/panels/layers.svg
        assets/icons/panels/asset_library.svg
        assets/icons/panels/attributes.svg
        assets/icons/status/performance.svg
        assets/icons/status/history.svg
        assets/icons/status/help.svg
        assets/icons/status/engine_ready.svg
        assets/icons/menu/save.svg
        assets/icons/menu/open.svg
        assets/icons/menu/zoom_out.svg
        assets/icons/menu/zoom_in.svg
        assets/icons/menu/new.svg
        assets/icons/menu/vulkan.svg
        assets/icons/menu/opengl.svg
        assets/icons/general/settings.svg
        assets/icons/general/fit_to_screen.svg
        assets/icons/general/redo.svg
        assets/icons/general/undo.svg


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
