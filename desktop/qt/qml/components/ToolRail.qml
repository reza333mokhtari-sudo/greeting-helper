import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import DungeonEditor.Canvas 1.0

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    id: root
    color: "#252526"
    
    property string currentTool: "select"

    ColumnLayout {
        anchors.fill: parent
        spacing: 10
        
        ToolButton {
            text: "S"
            checkable: true
            checked: root.currentTool === "select"
            onClicked: root.currentTool = "select"
            ToolTip.visible: hovered
            ToolTip.text: "Select"
        }
        
        ToolButton {
            text: "D"
            checkable: true
            checked: root.currentTool === "draw"
            onClicked: root.currentTool = "draw"
            ToolTip.visible: hovered
            ToolTip.text: "Draw Rect"
        }
        
        ToolButton {
            text: "P"
            checkable: true
            checked: root.currentTool === "pan"
            onClicked: root.currentTool = "pan"
            ToolTip.visible: hovered
            ToolTip.text: "Pan"
        }
        
        Item { Layout.fillHeight: true }
    }
}
