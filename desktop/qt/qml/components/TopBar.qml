import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    color: "#2d2d2d"
    border.color: "#3e3e42"

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 12
        anchors.rightMargin: 12
        spacing: 12
        
        Label {
            text: qsTr("Dungeon Editor")
            color: "white"
            font.bold: true
        }

        ToolSeparator {}

        Button {
            text: qsTr("New")
            flat: true
            onClicked: mapDocument.clear()
        }
        
        Button {
            text: qsTr("Open...")
            flat: true
            onClicked: mapDocument.load("map.json")
        }
        
        Button {
            text: qsTr("Save")
            flat: true
            highlighted: true
            onClicked: mapDocument.save("map.json")
        }

        ToolSeparator {}

        RowLayout {
            spacing: 4
            Button { text: "↺"; flat: true; onClicked: mapDocument.undo() }
            Button { text: "↻"; flat: true; onClicked: mapDocument.redo() }
        }

        Item { Layout.fillWidth: true }
        
        Label {
            text: qsTr("Grid")
            color: "gray"
        }
        Switch {
            id: gridSwitch
            checked: true
            onToggled: mapDocument.setGridVisible(checked)
        }
        
        Button {
            text: qsTr("Export PNG")
            onClicked: console.log("Exporting...")
        }
    }
}
