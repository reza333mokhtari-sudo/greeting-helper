import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * DCC Style Status Bar
 */

DccPanel {
    id: root
    height: 24
    color: "#161616"

    
    property var canvas: null
    property var document: null
    property var workspace: null

    property int selectionCount: document && document.selectedId !== "" ? 1 : 0

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 15
        anchors.rightMargin: 15
        spacing: 15
        
        DccLabel {
            text: (workspace ? workspace.activeTool.toUpperCase() : (canvas ? canvas.activeTool.toUpperCase() : "NONE"))
            color: "#f59e0b"
            font.pixelSize: 10
            font.bold: true
        }

        
        Rectangle { width: 1; height: 14; color: "#333" }

        DccLabel {
            text: qsTr("SELECTION: ") + root.selectionCount
            color: "#888"
            font.pixelSize: 10
        }

        Item { Layout.fillWidth: true }
        
        DccLabel {
            text: qsTr("ZOOM: ") + (canvas ? (canvas.zoom * 100).toFixed(0) : "100") + "%"
            color: "#888"
            font.pixelSize: 10
        }
        
        Rectangle { width: 1; height: 14; color: "#333" }

        RowLayout {
            spacing: 8
            Rectangle {
                width: 8; height: 8; radius: 4
                color: (typeof aiClient !== 'undefined' && aiClient && aiClient.isLoading) ? "#f59e0b" : "#10b981"
            }
            DccLabel {
                text: (typeof aiClient !== 'undefined' && aiClient && aiClient.isLoading) ? qsTr("AI PROCESSING") : qsTr("ENGINE READY")
                color: "#ccc"
                font.pixelSize: 10
                font.bold: true
            }
        }
    }
}
