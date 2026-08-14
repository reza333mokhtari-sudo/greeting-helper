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
        anchors.leftMargin: 10
        anchors.rightMargin: 10
        
        Label {
            text: "Dungeon Editor"
            color: "white"
            font.bold: true
        }
        
        Item { Layout.fillWidth: true }
        
        Button {
            text: "New"
            onClicked: console.log("New Map")
        }
        Button {
            text: "Save"
            onClicked: mapDocument.save("map.json")
        }
        Button {
            text: "Load"
            onClicked: mapDocument.load("map.json")
        }
    }
}
