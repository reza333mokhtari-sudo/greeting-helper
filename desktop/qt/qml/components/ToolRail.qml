import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import DungeonEditor.components

/**
 * DCC Style Tool Rail
 */

DccPanel {
    id: root
    width: 48
    color: "#1e1e1e"

    
    property var canvas: null
    
    ColumnLayout {
        anchors.fill: parent
        anchors.topMargin: 15
        spacing: 12
        
        ButtonGroup { id: toolGroup }

        Button {
            id: selectBtn
            Layout.preferredWidth: 32
            Layout.preferredHeight: 32
            Layout.alignment: Qt.AlignHCenter
            checkable: true
            checked: canvas.activeTool === "select"
            onClicked: canvas.activeTool = "select"
            ButtonGroup.group: toolGroup
            
            background: Rectangle {
                color: selectBtn.checked ? "#3d3d3d" : (selectBtn.hovered ? "#333" : "transparent")
                border.color: selectBtn.checked ? "#f59e0b" : "transparent"
                border.width: 1
                radius: 2
            }
            contentItem: AppIcon {
                icon: "tools/select"
                size: 18
                active: selectBtn.checked
            }
            ToolTip.visible: hovered; ToolTip.text: "Select (Q)"
        }
        
        Button {
            id: moveBtn
            Layout.preferredWidth: 32
            Layout.preferredHeight: 32
            Layout.alignment: Qt.AlignHCenter
            checkable: true
            checked: canvas.activeTool === "move"
            onClicked: canvas.activeTool = "move"
            ButtonGroup.group: toolGroup
            
            background: Rectangle {
                color: moveBtn.checked ? "#3d3d3d" : (moveBtn.hovered ? "#333" : "transparent")
                border.color: moveBtn.checked ? "#f59e0b" : "transparent"
                border.width: 1
                radius: 2
            }
            contentItem: AppIcon {
                icon: "tools/move"
                size: 18
                active: moveBtn.checked
            }
            ToolTip.visible: hovered; ToolTip.text: "Move (W)"
        }

        Button {
            id: drawBtn
            Layout.preferredWidth: 32
            Layout.preferredHeight: 32
            Layout.alignment: Qt.AlignHCenter
            checkable: true
            checked: canvas.activeTool === "draw" || canvas.activeTool === "room"
            onClicked: canvas.activeTool = "draw"
            ButtonGroup.group: toolGroup
            
            background: Rectangle {
                color: drawBtn.checked ? "#3d3d3d" : (drawBtn.hovered ? "#333" : "transparent")
                border.color: drawBtn.checked ? "#f59e0b" : "transparent"
                border.width: 1
                radius: 2
            }
            contentItem: AppIcon {
                icon: "tools/draw_room"
                size: 18
                active: drawBtn.checked
            }
            ToolTip.visible: hovered; ToolTip.text: "Draw Room (R)"
        }

        Rectangle { Layout.fillWidth: true; height: 1; color: "#333"; Layout.leftMargin: 4; Layout.rightMargin: 4 }

        Button {
            id: deleteBtn
            Layout.preferredWidth: 32
            Layout.preferredHeight: 32
            Layout.alignment: Qt.AlignHCenter
            onClicked: {
                if (canvas.selectedId !== "") {
                    canvas.document.removeObject(canvas.selectedId);
                }
            }
            background: Rectangle {
                color: deleteBtn.pressed ? "#444" : (deleteBtn.hovered ? "#333" : "transparent")
                radius: 2
            }
            contentItem: AppIcon {
                icon: "tools/eraser"
                size: 18
                color: deleteBtn.hovered ? "#ff4444" : "#aaa"
            }
            ToolTip.visible: hovered; ToolTip.text: "Delete (Del)"
        }

        Item { Layout.fillHeight: true }
        
        Button {
            id: helpBtn
            Layout.preferredWidth: 32
            Layout.preferredHeight: 32
            Layout.alignment: Qt.AlignHCenter
            onClicked: helpWindow.show()
            background: Rectangle {
                color: helpBtn.hovered ? "#333" : "transparent"
                radius: 2
            }
            contentItem: AppIcon {
                icon: "status/help"
                size: 18
            }
        }
    }
}
