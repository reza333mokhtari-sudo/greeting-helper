import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    color: "#252526"
    border.color: "#3e3e42"
    
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 5
        
        Label {
            text: "Asset Library"
            color: "white"
            font.bold: true
        }
        
        TextField {
            placeholderText: "Search assets..."
            Layout.fillWidth: true
            color: "white"
            background: Rectangle { color: "#3c3c3c" }
        }
        
        ListView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            model: assetModel
            delegate: ItemDelegate {
                width: parent.width
                height: 40
                contentItem: RowLayout {
                    spacing: 10
                    Rectangle {
                        width: 30; height: 30
                        color: "#555"
                        Text { anchors.centerIn: parent; text: name[0]; color: "white" }
                    }
                    Text { text: name; color: "white"; Layout.fillWidth: true }
                }
                onClicked: {
                    console.log("Adding asset:", name)
                    mapDocument.addObject({"kind": "image", "name": name, "x": 100, "y": 100})
                }
            }
        }
    }
}
