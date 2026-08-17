import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import DungeonEditor.Core 1.0
import DungeonEditor.Canvas 1.0
import DungeonEditor.Models 1.0
import DungeonEditor.Services 1.0
import "components"

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
    AiClient { id: aiClient }

    Component.onCompleted: {
        console.log("Dungeon Scrawl Desktop Shell Initialized");
        assetModel.loadManifest("assets/soulslike/manifest.json");
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 0
        
        TopBar {
            id: topBar
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

            ToolRail {
                id: toolRail
                SplitView.minimumWidth: 60
                SplitView.preferredWidth: 60
                canvas: canvas
            }
            
            Item {
                SplitView.fillWidth: true
                clip: true
                
                MapCanvasItem {
                    id: canvas
                    anchors.fill: parent
                    document: mapDoc
                    onSelectionChanged: (id) => rightDock.updateInspector(id)
                }
                
                // Cursor coords overlay
                Rectangle {
                    anchors.bottom: parent.bottom
                    anchors.left: parent.left
                    anchors.margins: 16
                    color: "#cc121212"
                    border.color: "#333"
                    radius: 6
                    width: coordsLayout.width + 24
                    height: coordsLayout.height + 12
                    
                    RowLayout {
                        id: coordsLayout
                        anchors.centerIn: parent
                        spacing: 12
                        Label {
                            text: "GRID SNAP"
                            color: "#3b82f6"
                            font.pixelSize: 9
                            font.bold: true
                            font.letterSpacing: 1
                        }
                        Label {
                            id: coordsLabel
                            text: "X: " + Math.round(canvas.cursorWorldPos.x) + "  Y: " + Math.round(canvas.cursorWorldPos.y)
                            color: "#eee"
                            font.pixelSize: 11
                            font.family: "Monospace"
                        }
                    }
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
        
        StatusBar {
            Layout.fillWidth: true
            canvas: canvas
            document: mapDoc
        }
    }
}
