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
    
    background: Rectangle { color: "#121212" }

    Document { id: mapDoc }
    AssetLibraryModel { id: assetModel }
    FileService { id: fileService }
    AiClient { id: aiClient }

    Component.onCompleted: {
        assetModel.loadManifest("assets/soulslike/manifest.json")
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
        
        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: "#333"
        }

        SplitView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            orientation: Qt.Horizontal
            
            handle: Rectangle {
                implicitWidth: 2
                color: SplitView.isPressed ? "#007acc" : "#2d2d2d"
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
                    anchors.margins: 15
                    color: "#cc1e1e1e"
                    border.color: "#444"
                    radius: 4
                    width: coordsLabel.width + 20
                    height: coordsLabel.height + 10
                    RowLayout {
                        anchors.centerIn: parent
                        spacing: 10
                        Label {
                            id: coordsLabel
                            text: "X: " + Math.round(canvas.cursorWorldPos.x) + "  Y: " + Math.round(canvas.cursorWorldPos.y)
                            color: "#ccc"
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
