import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * Native Status Bar
 */

Rectangle {
    id: root
    height: 28
    color: "#1e1e1e"
    border.color: "#333333"
    
    property var canvas: null
    property var document: null
    property int selectionCount: canvas && canvas.selectedId !== "" ? 1 : 0

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 15
        anchors.rightMargin: 15
        spacing: 15
        
        Label {
            text: (canvas ? canvas.activeTool.toUpperCase() : "NONE")
            color: "#007acc"
            font.pixelSize: 10
            font.bold: true
        }
        
        Rectangle { width: 1; height: 14; color: "#444" }

        Label {
            text: qsTr("SELECTION: ") + root.selectionCount
            color: "#aaa"
            font.pixelSize: 10
        }

        Item { Layout.fillWidth: true }
        
        Label {
            text: qsTr("ZOOM: ") + (canvas ? (canvas.zoom * 100).toFixed(0) : "100") + "%"
            color: "#aaa"
            font.pixelSize: 10
        }
        
        Rectangle { width: 1; height: 14; color: "#444" }

        RowLayout {
            spacing: 8
            Rectangle {
                width: 8; height: 8; radius: 4
                color: (typeof aiClient !== 'undefined' && aiClient && aiClient.isLoading) ? "#f39c12" : "#27ae60"
            }
            Label {
                text: (typeof aiClient !== 'undefined' && aiClient && aiClient.isLoading) ? qsTr("AI PROCESSING") : qsTr("ENGINE READY")
                color: "#ccc"
                font.pixelSize: 10
                font.bold: true
            }
        }
    }
}
