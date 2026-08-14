import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import DungeonEditor.Canvas 1.0
import "components"

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

ApplicationWindow {
    id: window
    width: 1280
    height: 800
    visible: true
    title: qsTr("Dungeon Editor - Native Qt")

    background: Rectangle { color: "#1e1e1e" }

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        TopBar {
            Layout.fillWidth: true
            height: 40
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 0

            ToolRail {
                id: toolRail
                width: 50
                Layout.fillHeight: true
            }

            MapCanvasItem {
                id: canvas
                Layout.fillWidth: true
                Layout.fillHeight: true
                document: mapDocument
                currentTool: toolRail.currentTool
                
                focus: true
                
                Text {
                    anchors.bottom: parent.bottom
                    anchors.right: parent.right
                    anchors.margins: 10
                    text: "Zoom: " + (canvas.zoom * 100).toFixed(0) + "%"
                    color: "gray"
                }
            }

            ColumnLayout {
                width: 300
                Layout.fillHeight: true
                spacing: 0
                
                AssetLibrary {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                }
                
                InspectorPanel {
                    Layout.fillWidth: true
                    height: 250
                }
                
                AiPanel {
                    Layout.fillWidth: true
                    height: 250
                }
            }
        }

        StatusBar {
            Layout.fillWidth: true
            height: 25
        }
    }
}
