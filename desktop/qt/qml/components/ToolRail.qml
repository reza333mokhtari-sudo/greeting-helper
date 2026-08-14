import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * Native Tool Rail
 */

Rectangle {
    id: root
    width: 60
    color: "#1e1e1e"
    border.color: "#333333"
    
    property var canvas: null
    
    ColumnLayout {
        anchors.fill: parent
        anchors.topMargin: 15
        spacing: 15
        
        ButtonGroup { id: toolGroup }

        ToolButton {
            id: selectBtn
            text: "Select"
            icon.name: "cursor-arrow"
            checkable: true
            checked: canvas.activeTool === "select"
            onClicked: canvas.activeTool = "select"
            ButtonGroup.group: toolGroup
            display: AbstractButton.TextUnderIcon
            Layout.fillWidth: true
            ToolTip.visible: hovered; ToolTip.text: "Select Tool (V)"
        }
        
        ToolButton {
            id: drawBtn
            text: "Draw"
            icon.name: "draw-rectangle"
            checkable: true
            checked: canvas.activeTool === "draw"
            onClicked: canvas.activeTool = "draw"
            ButtonGroup.group: toolGroup
            display: AbstractButton.TextUnderIcon
            Layout.fillWidth: true
            ToolTip.visible: hovered; ToolTip.text: "Draw Room (R)"
        }
        
        ToolButton {
            id: moveBtn
            text: "Pan"
            icon.name: "input-mouse"
            checkable: true
            checked: canvas.activeTool === "pan"
            onClicked: canvas.activeTool = "pan"
            ButtonGroup.group: toolGroup
            display: AbstractButton.TextUnderIcon
            Layout.fillWidth: true
            ToolTip.visible: hovered; ToolTip.text: "Pan View (H or Middle Click)"
        }

        ToolSeparator { Layout.fillWidth: true; orientation: Qt.Horizontal; padding: 5 }

        ToolButton {
            text: "Delete"
            icon.name: "edit-delete"
            onClicked: {
                if (canvas.selectedId !== "") {
                    canvas.document.removeObject(canvas.selectedId);
                }
            }
            display: AbstractButton.TextUnderIcon
            Layout.fillWidth: true
            ToolTip.visible: hovered; ToolTip.text: "Delete Selected (Del)"
        }

        Item { Layout.fillHeight: true }
        
        ToolButton {
            text: "Help"
            icon.name: "help-about"
            display: AbstractButton.TextUnderIcon
            Layout.fillWidth: true
        }
    }
}
