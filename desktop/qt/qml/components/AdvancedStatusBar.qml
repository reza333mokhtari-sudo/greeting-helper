import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

Rectangle {
    id: root
    height: 28
    color: "#1e1e1e"
    
    property var canvas: null
    property var document: null

    Rectangle {
        anchors.top: parent.top
        width: parent.width
        height: 1
        color: "#3e3e42"
    }

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 10
        anchors.rightMargin: 10
        spacing: 15

        RowLayout {
            spacing: 8
            AppIcon { icon: "status/engine_ready"; size: 12; color: "#10b981" }
            Label {
                text: qsTr("Engine Ready")
                color: "#aaa"
                font.pixelSize: 11
            }
        }


        Rectangle { width: 1; height: 14; color: "#333" }

        Label {
            text: "SELECT"
            color: "#3b82f6"
            font.pixelSize: 9
            font.bold: true
        }

        Item { Layout.fillWidth: true }

        // Performance / Stats
        RowLayout {
            spacing: 12
            RowLayout {
                spacing: 4
                AppIcon { icon: "status/performance"; size: 12; color: "#666" }
                Label { text: "FPS: 60"; color: "#666"; font.pixelSize: 10; font.family: "Monospace" }
            }
            RowLayout {
                spacing: 4
                AppIcon { icon: "status/performance"; size: 12; color: "#666" }
                Label { text: "MEM: 128MB"; color: "#666"; font.pixelSize: 10; font.family: "Monospace" }
            }
            Label {
                text: "VULKAN"
                color: "#10b981"
                font.pixelSize: 9
                font.bold: true
            }
        }


        Rectangle { width: 1; height: 14; color: "#333" }

        Label {
            text: "X: " + (canvas ? Math.round(canvas.cursorWorldPos.x) : 0) + 
                  " Y: " + (canvas ? Math.round(canvas.cursorWorldPos.y) : 0)
            color: "#eee"
            font.pixelSize: 11
            font.family: "Monospace"
        }
    }
}
