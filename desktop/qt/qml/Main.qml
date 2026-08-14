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
    title: "Dungeon Editor Native"
    
    Document { id: mapDoc }
    AssetLibraryModel { id: assetModel }
    FileService { id: fileService }

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
        
        SplitView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            orientation: Qt.Horizontal
            
            ToolRail {
                id: toolRail
                SplitView.minimumWidth: 50
                SplitView.preferredWidth: 50
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
                    anchors.margins: 10
                    color: "#80000000"
                    radius: 4
                    width: coordsLabel.width + 10
                    height: coordsLabel.height + 4
                    Label {
                        id: coordsLabel
                        anchors.centerIn: parent
                        text: "X: " + Math.round(canvas.cursorWorldPos.x) + " Y: " + Math.round(canvas.cursorWorldPos.y)
                        color: "white"
                        font.pixelSize: 10
                    }
                }
            }
            
            RightDock {
                id: rightDock
                SplitView.minimumWidth: 300
                SplitView.preferredWidth: 350
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
