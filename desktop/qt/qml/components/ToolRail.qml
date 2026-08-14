import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * Native Tool Rail
 */

Rectangle {
    id: root
    width: 50
    color: "#2d2d2d"
    border.color: "#3e3e42"
    
    ColumnLayout {
        anchors.fill: parent
        anchors.topMargin: 10
        spacing: 10
        
        ToolButton {
            id: selectBtn
            text: "S"
            checkable: true
            checked: canvas.activeTool === "select"
            onClicked: canvas.activeTool = "select"
            ToolTip.visible: hovered; ToolTip.text: "Select (S)"
        }
        
        ToolButton {
            id: drawBtn
            text: "D"
            checkable: true
            checked: canvas.activeTool === "draw"
            onClicked: canvas.activeTool = "draw"
            ToolTip.visible: hovered; ToolTip.text: "Draw Room (D)"
        }
        
        ToolButton {
            id: moveBtn
            text: "M"
            checkable: true
            checked: canvas.activeTool === "move"
            onClicked: canvas.activeTool = "move"
            ToolTip.visible: hovered; ToolTip.text: "Move Object (M)"
        }

        ToolSeparator { Layout.fillWidth: true; orientation: Qt.Horizontal }

        ToolButton {
            text: "E"
            onClicked: {
                if (canvas.selectedId !== "") {
                    mapDocument.removeObject(canvas.selectedId);
                }
            }
            ToolTip.visible: hovered; ToolTip.text: "Erase Selected (E)"
        }

        Item { Layout.fillHeight: true }
    }
}
