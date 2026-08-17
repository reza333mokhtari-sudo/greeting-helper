import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import DungeonEditor.Core 1.0
import DungeonEditor.Canvas 1.0
import DungeonEditor.Models 1.0
import DungeonEditor.Services 1.0
import "components"
import "panels"
import "dialogs"

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


    PreferencesDialog {
        id: preferencesDialog
    }

    Component.onCompleted: {
        console.log("Dungeon Scrawl Desktop Shell Initialized");
        assetModel.loadManifest("assets/soulslike/manifest.json");
        loadWorkspace("Default");
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
        
        // Maya Top Bar (Menu)
        TopBar {
            id: topBar
            Layout.fillWidth: true
            document: mapDoc
            canvas: canvas
        }

        // Maya Shelf & Status Line
        MayaShelf {
            id: shelf
            Layout.fillWidth: true
            document: mapDoc
            canvas: canvas
        }
        
        SplitView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            orientation: Qt.Horizontal
            
            handle: Rectangle {
                implicitWidth: 2
                color: SplitView.isPressed ? "#3b82f6" : "#222"
            }

            // Maya Tool Box
            MayaToolBox {
                id: toolBox
                SplitView.minimumWidth: 50
                SplitView.preferredWidth: 50
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
                    height: 28
                    color: "#cc1e1e1e"
                    RowLayout {
                        anchors.fill: parent
                        anchors.leftMargin: 10
                        spacing: 8
                        ToolButton { text: "Cam"; font.pixelSize: 10 }
                        ToolButton { 
                            text: "Grid"
                            font.pixelSize: 10
                            checkable: true
                            checked: mapDoc.gridVisible
                            onToggled: mapDoc.gridVisible = checked
                        }
                        ToolButton { text: "Light"; font.pixelSize: 10 }
                        Item { Layout.fillWidth: true }
                        Label { text: "[ Perspective ]"; color: "#aaa"; font.pixelSize: 10 }
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
            
            RightDock {
                id: rightDock
                SplitView.minimumWidth: 320
                SplitView.preferredWidth: 380
                document: mapDoc
                canvas: canvas
                assetModel: assetModel
            }
        }
        
        AdvancedStatusBar {
            Layout.fillWidth: true
            canvas: canvas
            document: mapDoc
        }
    }
}
