import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    color: "#252526"
    property string activeTool: "select"
    signal toolChanged(string tool)

    ColumnLayout {
        anchors.fill: parent
        spacing: 4
        anchors.topMargin: 8

        ButtonGroup { id: toolGroup }

        ToolButton {
            id: selectTool
            text: "V"
            checkable: true
            checked: activeTool === "select"
            ButtonGroup.group: toolGroup
            onClicked: toolChanged("select")
            ToolTip.visible: hovered; ToolTip.text: qsTr("Select (V)")
        }

        ToolButton {
            id: drawTool
            text: "R"
            checkable: true
            checked: activeTool === "draw"
            ButtonGroup.group: toolGroup
            onClicked: toolChanged("draw")
            ToolTip.visible: hovered; ToolTip.text: qsTr("Draw Room (R)")
        }

        ToolButton {
            id: panTool
            text: "H"
            checkable: true
            checked: activeTool === "pan"
            ButtonGroup.group: toolGroup
            onClicked: toolChanged("pan")
            ToolTip.visible: hovered; ToolTip.text: qsTr("Pan (H)")
        }

        ToolButton {
            id: deleteTool
            text: "X"
            onClicked: toolChanged("delete")
            ToolTip.visible: hovered; ToolTip.text: qsTr("Delete Selected (X)")
        }

        Item { Layout.fillHeight: true }
    }
}
