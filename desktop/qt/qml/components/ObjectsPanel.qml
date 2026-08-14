import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    color: "#252526"
    property var document

    signal objectSelected(string id)

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        
        Label {
            text: qsTr("Objects in Map")
            color: "white"
            font.bold: true
        }

        TextField {
            id: searchField
            placeholderText: qsTr("Search objects...")
            Layout.fillWidth: true
            background: Rectangle { color: "#3c3c3c"; radius: 4 }
            color: "white"
        }

        ListView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            model: document ? document.objects : null
            spacing: 2
            
            delegate: ItemDelegate {
                width: ListView.view.width
                height: 30
                highlighted: ListView.isCurrentItem
                
                contentItem: RowLayout {
                    Label {
                        text: modelData.kind === "rect" ? "□" : "○"
                        color: "#888888"
                    }
                    Label {
                        text: modelData.name
                        color: "white"
                        Layout.fillWidth: true
                    }
                }
                
                onClicked: {
                    objectSelected(modelData.id)
                }
                
                background: Rectangle {
                    color: highlighted ? "#37373d" : "transparent"
                }
            }
        }
    }
}
