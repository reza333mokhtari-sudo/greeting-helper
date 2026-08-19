import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import "qrc:/qt/qml/DungeonEditor/qml/components"

Rectangle {
    id: root
    height: 24
    color: "#1a1a1a"
    
    property var canvas: null
    property var document: null

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 8
        anchors.rightMargin: 8
        spacing: 12

        ZBrushLabel {
            text: "ZBRUSH ENGINE"
            color: "#f59e0b"
            font.bold: true
            font.pixelSize: 9
        }

        Rectangle { width: 1; height: 12; color: "#333" }

        ZBrushLabel {
            text: canvas ? canvas.activeTool.toUpperCase() : "READY"
            color: "#888"
            font.pixelSize: 9
        }

        Item { Layout.fillWidth: true }

        ZBrushLabel {
            text: "X: " + (canvas ? Math.round(canvas.cursorWorldPos.x) : 0) + " Y: " + (canvas ? Math.round(canvas.cursorWorldPos.y) : 0)
            color: "#666"
            font.pixelSize: 9
            font.family: "Monospace"
        }

        ZBrushLabel {
            text: "VULKAN RHI"
            color: "#10b981"
            font.pixelSize: 9
            font.bold: true
        }
    }
}
