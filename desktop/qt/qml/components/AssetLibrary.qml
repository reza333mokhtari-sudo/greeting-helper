import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    color: "#252526"
    border.color: "#3e3e42"
    
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 10
        
        Label {
            text: qsTr("Asset Library")
            color: "white"
            font.bold: true
        }
        
        TextField {
            id: searchField
            placeholderText: qsTr("Search assets...")
            Layout.fillWidth: true
            color: "white"
            background: Rectangle { color: "#3c3c3c"; radius: 4 }
        }
        
        RowLayout {
            Layout.fillWidth: true
            Button { text: "All"; highlighted: true; Layout.fillWidth: true }
            Button { text: "Props"; Layout.fillWidth: true }
            Button { text: "NPCs"; Layout.fillWidth: true }
        }

        GridView {
            id: grid
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            cellWidth: 80
            cellHeight: 100
            model: assetModel
            
            delegate: Item {
                width: 80
                height: 100
                
                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 4
                    
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 60
                        color: "#3e3e42"
                        radius: 4
                        border.color: mouseArea.containsMouse ? "#007acc" : "transparent"
                        
                        Text {
                            anchors.centerIn: parent
                            text: name[0]
                            color: "white"
                            font.pixelSize: 20
                        }
                        
                        MouseArea {
                            id: mouseArea
                            anchors.fill: parent
                            hoverEnabled: true
                            onClicked: {
                                mapDocument.addObject({
                                    kind: "image",
                                    name: name,
                                    assetId: assetId,
                                    x: 100,
                                    y: 100
                                })
                            }
                        }
                    }
                    
                    Text {
                        text: name
                        color: "white"
                        font.pixelSize: 10
                        Layout.fillWidth: true
                        horizontalAlignment: Text.AlignHCenter
                        elide: Text.ElideRight
                    }
                }
            }
        }
        
        Button {
            text: qsTr("Import Asset...")
            Layout.fillWidth: true
        }
    }
}
