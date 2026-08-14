import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    color: "#007acc"
    
    property string currentTool: "select"
    property double zoom: 1.0
    property int selectionCount: 0

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 10
        anchors.rightMargin: 10
        
        Label {
            text: qsTr("Tool: ") + (canvas ? canvas.activeTool.toUpperCase() : "NONE")
            color: "white"
            font.pixelSize: 11
        }
        
        ToolSeparator { visible: true }

        Label {
            text: qsTr("Selection: ") + root.selectionCount
            color: "white"
            font.pixelSize: 11
        }

        Item { Layout.fillWidth: true }
        
        Label {
            text: (canvas ? canvas.zoom * 100 : 100).toFixed(0) + "%"
            color: "white"
            font.pixelSize: 11
        }
        
        ToolSeparator {}

        Rectangle {
            width: 10; height: 10; radius: 5
            color: aiClient.isLoading ? "orange" : "lightgreen"
        }
        Label {
            text: aiClient.isLoading ? qsTr("AI Working...") : qsTr("Online")
            color: "white"
            font.pixelSize: 11
        }
    }
}
