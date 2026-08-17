import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

Rectangle {
    id: root
    width: 50
    color: "#252526"
    
    property var canvas: null
    property string activeTool: "select"

    ColumnLayout {
        anchors.fill: parent
        anchors.topMargin: 10
        spacing: 4

        ToolButton {
            id: selectBtn
            Layout.alignment: Qt.AlignHCenter
            contentItem: AppIcon {
                icon: "tools/select"
                active: canvas ? canvas.activeTool === "select" : true
                size: 20
            }
            onClicked: if (canvas) canvas.activeTool = "select"
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Select Tool (Q)")
        }

        ToolButton {
            id: moveBtn
            Layout.alignment: Qt.AlignHCenter
            contentItem: AppIcon {
                icon: "tools/move"
                active: canvas ? canvas.activeTool === "move" : false
                size: 20
            }
            onClicked: if (canvas) canvas.activeTool = "move"
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Move Tool (W)")
        }

        ToolButton {
            id: drawBtn
            Layout.alignment: Qt.AlignHCenter
            contentItem: AppIcon {
                icon: "tools/draw_room"
                active: canvas ? canvas.activeTool === "draw" : false
                size: 20
            }
            onClicked: if (canvas) canvas.activeTool = "draw"
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Draw Room (D)")
        }

        ToolButton {
            id: propBtn
            Layout.alignment: Qt.AlignHCenter
            contentItem: AppIcon {
                icon: "tools/place_prop"
                active: canvas ? canvas.activeTool === "place_prop" : false
                size: 20
            }
            onClicked: if (canvas) canvas.activeTool = "place_prop"
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Place Prop")
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 1
            color: "#3e3e42"
            Layout.margins: 4
        }

        ToolButton {
            id: brushBtn
            Layout.alignment: Qt.AlignHCenter
            contentItem: AppIcon {
                icon: "tools/texture_brush"
                active: canvas ? canvas.activeTool === "texture_brush" : false
                size: 20
            }
            onClicked: if (canvas) canvas.activeTool = "texture_brush"
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Texture Brush")
        }

        ToolButton {
            id: eraserBtn
            Layout.alignment: Qt.AlignHCenter
            contentItem: AppIcon {
                icon: "tools/eraser"
                active: canvas ? canvas.activeTool === "eraser" : false
                size: 20
            }
            onClicked: if (canvas) canvas.activeTool = "eraser"
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Eraser Tool")
        }



        ToolButton {
            Layout.alignment: Qt.AlignHCenter
            text: "L"
            onClicked: { /* Toggle Outliner */ }
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Toggle Outliner")
        }
    }
}
