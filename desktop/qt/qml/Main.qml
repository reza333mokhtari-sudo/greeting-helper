import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import DungeonEditor.Canvas 1.0
import "components"

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

ApplicationWindow {
    id: window
    width: 1400
    height: 900
    visible: true
    title: qsTr("Dungeon Editor - Native Pro")

    background: Rectangle { color: "#1e1e1e" }

    // Selection & Navigation State
    property string activeTool: "select"
    property var selectedObject: null
    property double zoomLevel: 1.0

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        TopBar {
            id: topBar
            Layout.fillWidth: true
            height: 48
        }

        SplitView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            orientation: Qt.Horizontal

            ToolRail {
                id: toolRail
                SplitView.preferredWidth: 50
                SplitView.maximumWidth: 50
                activeTool: window.activeTool
                onToolChanged: (tool) => window.activeTool = tool
            }

            MapCanvasItem {
                id: canvas
                SplitView.fillWidth: true
                document: mapDocument
                currentTool: window.activeTool
                zoom: window.zoomLevel
                
                onZoomChanged: window.zoomLevel = zoom
                onSelectionChanged: (obj) => window.selectedObject = obj
                
                focus: true
                Keys.onPressed: (event) => {
                    if (event.key === Qt.Key_Delete || event.key === Qt.Key_Backspace) {
                        if (window.selectedObject) mapDocument.removeObject(window.selectedObject.id)
                    } else if (event.modifiers & Qt.ControlModifier) {
                        if (event.key === Qt.Key_Z) mapDocument.undo()
                        else if (event.key === Qt.Key_Y) mapDocument.redo()
                        else if (event.key === Qt.Key_S) mapDocument.save("map.json")
                    }
                }
            }

            RightDock {
                id: rightDock
                SplitView.preferredWidth: 320
                SplitView.minimumWidth: 250
            }
        }

        StatusBar {
            Layout.fillWidth: true
            height: 28
            currentTool: window.activeTool
            zoom: window.zoomLevel
            selectionCount: window.selectedObject ? 1 : 0
        }
    }
}
