import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    color: "#252526"
    property var document: null

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 15
        spacing: 15

        Label {
            text: qsTr("CMS Pages")
            color: "white"
            font.bold: true
            font.pixelSize: 18
        }

        TextField {
            id: searchBar
            placeholderText: qsTr("Search pages...")
            Layout.fillWidth: true
            background: Rectangle { color: "#3c3c3c"; radius: 4 }
            color: "white"
        }

        ListView {
            id: cmsList
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            model: 3 // Placeholder
            delegate: ItemDelegate {
                width: cmsList.width
                contentItem: Column {
                    spacing: 4
                    Label { text: "Page Title " + (index + 1); color: "white"; font.bold: true }
                    Label { text: "/slug-" + (index + 1); color: "#888"; font.pixelSize: 10 }
                }
                background: Rectangle {
                    color: hovered ? "#3c3c3c" : "transparent"
                    radius: 4
                }
            }
        }

        Button {
            text: qsTr("Create New Page")
            Layout.fillWidth: true
            onClicked: console.log("Create new CMS page")
        }
    }
}
