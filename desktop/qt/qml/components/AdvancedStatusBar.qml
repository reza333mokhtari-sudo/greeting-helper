import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import "qrc:/qt/qml/DungeonEditor/qml/components"

DccPanel {
    id: root
    height: 24
    
    property var canvas: null
    property var document: null

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 8
        anchors.rightMargin: 8
        spacing: 12

        DccLabel {
            text: "PRECISION CORE"
            color: "#f59e0b"
            font.bold: true
            font.pixelSize: 9
        }

        Rectangle { width: 1; height: 12; color: "#333" }

        DccLabel {
            text: canvas ? canvas.activeTool.toUpperCase() : "READY"
            color: "#888"
            font.pixelSize: 9
        }

        Item { Layout.fillWidth: true }

        DccLabel {
            text: "X: " + (canvas ? Math.round(canvas.cursorWorldPos.x) : 0) + " Y: " + (canvas ? Math.round(canvas.cursorWorldPos.y) : 0)
            color: "#666"
            font.pixelSize: 9
            font.family: "Monospace"
        }

        DccLabel {
            text: "VULKAN RHI"
            color: "#10b981"
            font.pixelSize: 9
            font.bold: true
        }
    }
}
