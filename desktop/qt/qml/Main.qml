import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import DungeonEditor.Core 1.0
import DungeonEditor.Canvas 1.0
import DungeonEditor.Models 1.0
import DungeonEditor.Services 1.0
import "qrc:/qml/components"
import "qrc:/qml/panels"
import "qrc:/qml/dialogs"

ApplicationWindow {
    id: window
    width: 1400
    height: 900
    visible: true
    title: "DUNGEON SCRAWL - Professional Editor"
    
    background: Rectangle { color: "#0a0a0a" }

    Document { id: mapDoc }
    AssetLibraryModel { id: assetModel }
    FileService { id: fileService }
    WorkspaceService { id: workspaceService }
    AiClient { id: aiClient }
    LicenseService { id: licenseService }

    WelcomeWindow { id: welcomeWindow }
    HelpWindow { id: helpWindow }
    AboutWindow { id: aboutWindow }
    LicenseWindow { id: licenseWindow }

    PreferencesDialog {
        id: preferencesDialog
    }

    Component.onCompleted: {
        console.log("Dungeon Scrawl Desktop Shell Initialized");
        assetModel.loadManifest("assets/soulslike/manifest.json");
        loadWorkspace("Default");
        
        // Auto-show welcome screen if not disabled
        let showWelcome = workspaceService.loadLayout("Settings").showWelcome !== false;
        if (showWelcome) {
            welcomeWindow.show();
        }
    }

    function saveWorkspace(name) {
        let layout = {
            "toolBoxWidth": toolBox.width,
            "rightDockWidth": rightDock.width,
            "aiPanelHeight": rightDock.aiPanelHeight
        };
        workspaceService.saveLayout(name, layout);
    }

    function loadWorkspace(name) {
        let layout = workspaceService.loadLayout(name);
        if (Object.keys(layout).length > 0) {
            toolBox.width = layout.toolBoxWidth || 50;
            rightDock.width = layout.rightDockWidth || 380;
            rightDock.aiPanelHeight = layout.aiPanelHeight || 250;
        }
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 0
        
        // 1. Menu Bar
        TopBar {
            id: topBar
            Layout.fillWidth: true
            document: mapDoc
            canvas: canvas
        }

        // 2. Status Line (History/Undo/Redo & Engine Status)
        Rectangle {
            Layout.fillWidth: true
            height: 32
            color: "#1e1e1e"
            border.color: "#2d2d2d"
            
            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 8
                anchors.rightMargin: 8
                spacing: 4
                
                ToolButton {
                    icon.source: "qrc:/assets/icons/general/undo.svg"
                    display: AbstractButton.IconOnly
                    enabled: mapDoc.canUndo
                    onClicked: mapDoc.undo()
                }
                ToolButton {
                    icon.source: "qrc:/assets/icons/general/redo.svg"
                    display: AbstractButton.IconOnly
                    enabled: mapDoc.canRedo
                    onClicked: mapDoc.redo()
                }
                
                Rectangle { width: 1; height: 16; color: "#333"; Layout.leftMargin: 4; Layout.rightMargin: 4 }

                Label {
                    text: mapDoc.dirty ? "Modified" : "Ready"
                    font.pixelSize: 11
                    color: mapDoc.dirty ? "#f59e0b" : "#666"
                }

                Item { Layout.fillWidth: true }
                
                AppIcon { icon: "status/engine_ready"; size: 14; color: "#10b981" }
                Label { text: "Renderer: Vulkan"; font.pixelSize: 10; color: "#888" }
            }
        }

        // 3. Shelf
        MayaShelf {
            id: shelf
            Layout.fillWidth: true
            document: mapDoc
            canvas: canvas
        }
        
        SplitView {
            id: mainSplit
            Layout.fillWidth: true
            Layout.fillHeight: true
            orientation: Qt.Horizontal
            
            handle: Rectangle {
                implicitWidth: 1
                color: "#2d2d2d"
            }



            // 4. Left Tool Box
            MayaToolBox {
                id: toolBox
                SplitView.minimumWidth: 48
                SplitView.preferredWidth: 48
                canvas: canvas
            }
            
            Item {
                SplitView.fillWidth: true
                clip: true
                
                // Viewport Toolbar
                Rectangle {
                    id: viewportToolbar
                    z: 10
                    width: parent.width
                    height: 32
                    color: "#cc161616"
                    RowLayout {
                        anchors.fill: parent
                        anchors.leftMargin: 10
                        spacing: 12
                        
                        RowLayout {
                            spacing: 4
                            AppIcon { icon: "status/help"; size: 14; color: "#aaa" }
                            Label { text: "Perspective"; color: "#ccc"; font.pixelSize: 11; font.bold: true }
                        }

                        Rectangle { width: 1; height: 16; color: "#333" }

                        ToolButton { 
                            contentItem: AppIcon { icon: "tools/grid"; size: 14; active: mapDoc.gridVisible }
                            checkable: true
                            checked: mapDoc.gridVisible
                            onToggled: mapDoc.gridVisible = checked
                        }
                        
                        Item { Layout.fillWidth: true }
                        
                        Label { text: "60 FPS"; color: "#10b981"; font.pixelSize: 10; font.family: "Monospace" }
                    }
                }

                MapCanvasItem {
                    id: canvas
                    anchors.top: viewportToolbar.bottom
                    anchors.bottom: parent.bottom
                    anchors.left: parent.left
                    anchors.right: parent.right
                    document: mapDoc
                    onSelectionChanged: (id) => rightDock.updateInspector(id)
                }
            }
            
            // 5. Right Docks
            RightDock {
                id: rightDock
                SplitView.minimumWidth: 300
                SplitView.preferredWidth: 360
                document: mapDoc
                canvas: canvas
                assetModel: assetModel
            }
        }
        
        // 6. Advanced Status Bar
        AdvancedStatusBar {
            Layout.fillWidth: true
            canvas: canvas
            document: mapDoc
        }
    }
}

