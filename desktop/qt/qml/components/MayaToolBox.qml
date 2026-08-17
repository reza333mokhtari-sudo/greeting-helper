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
            checked: activeTool === "select"
            onClicked: activeTool = "select"
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Select Tool (Q)")
        }

        ToolButton {
            id: moveTool
            Layout.alignment: Qt.AlignHCenter
            text: "M"
            checkable: true
            checked: activeTool === "move"
            onClicked: activeTool = "move"
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Move Tool (W)")
        }

        ToolButton {
            id: rotateTool
            Layout.alignment: Qt.AlignHCenter
            text: "R"
            checkable: true
            checked: activeTool === "rotate"
            onClicked: activeTool = "rotate"
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Rotate Tool (E)")
        }

        ToolButton {
            id: scaleTool
            Layout.alignment: Qt.AlignHCenter
            text: "Sc"
            checkable: true
            checked: activeTool === "scale"
            onClicked: activeTool = "scale"
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
            checked: activeTool === "draw"
            onClicked: activeTool = "draw"
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Draw Room (D)")
        }

        Item { Layout.fillHeight: true }

        ToolButton {
            Layout.alignment: Qt.AlignHCenter
            text: "L"
            onClicked: { /* Toggle Outliner */ }
            ToolTip.visible: hovered
            ToolTip.text: qsTr("Toggle Outliner")
        }
    }
}
