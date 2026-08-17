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
            id: selectTool
            Layout.alignment: Qt.AlignHCenter
            text: "S"
            checkable: true
            checked: canvas ? canvas.activeTool === "select" : activeTool === "select"
            onClicked: if (canvas) canvas.activeTool = "select"
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Select Tool (Q)")
        }

        ToolButton {
            id: moveTool
            Layout.alignment: Qt.AlignHCenter
            text: "M"
            checkable: true
            checked: canvas ? canvas.activeTool === "move" : activeTool === "move"
            onClicked: if (canvas) canvas.activeTool = "move"
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Move Tool (W)")
        }

        ToolButton {
            id: rotateTool
            Layout.alignment: Qt.AlignHCenter
            text: "R"
            checkable: true
            checked: canvas ? canvas.activeTool === "rotate" : activeTool === "rotate"
            onClicked: if (canvas) canvas.activeTool = "rotate"
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Rotate Tool (E)")
        }

        ToolButton {
            id: scaleTool
            Layout.alignment: Qt.AlignHCenter
            text: "Sc"
            checkable: true
            checked: canvas ? canvas.activeTool === "scale" : activeTool === "scale"
            onClicked: if (canvas) canvas.activeTool = "scale"
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Scale Tool (R)")
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 1
            color: "#3e3e42"
            Layout.margins: 4
        }

        ToolButton {
            Layout.alignment: Qt.AlignHCenter
            text: "Dr"
            checkable: true
            checked: canvas ? canvas.activeTool === "draw" : activeTool === "draw"
            onClicked: if (canvas) canvas.activeTool = "draw"
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Draw Room (D)")
        }

        ToolButton {
            Layout.alignment: Qt.AlignHCenter
            text: "Er"
            checkable: true
            checked: canvas ? canvas.activeTool === "eraser" : false
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
