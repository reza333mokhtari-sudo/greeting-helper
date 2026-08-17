import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    id: root
    color: "#252526"
    border.color: "#3e3e42"
    
    property var model: null
    property var document: null
    property var canvas: null
    
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

            onTextChanged: root.model.searchQuery = text
        }
        
        ScrollView {
            Layout.fillWidth: true
            Layout.preferredHeight: 40
            ScrollBar.vertical.policy: ScrollBar.AlwaysOff
            RowLayout {
                spacing: 4
                Repeater {
                    model: ["All", "Weapons", "Armor", "Bosses", "Architecture", "Environment"]
                    Button {
                        text: modelData
                        flat: true
                        highlighted: root.model.activeCategory === modelData
                        onClicked: root.model.activeCategory = modelData
                    }
                }
            }
        }

        GridView {
            id: grid
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            cellWidth: 80
            cellHeight: 100
            model: root.model
            
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
                        
                        Image {
                            anchors.fill: parent
                            anchors.margins: 4
                            source: icon ? icon : ""
                            fillMode: Image.PreserveAspectFit
                            visible: icon !== ""
                        }
                        
                        Text {
                            anchors.centerIn: parent
                            text: name[0]
                            color: "white"
                            font.pixelSize: 20
                            visible: icon === ""
                        }
                        
                        MouseArea {
                            id: mouseArea
                            anchors.fill: parent
                            hoverEnabled: true
                            onClicked: {
                                root.document.addObject({
                                    kind: "image",
                                    name: name,
                                    assetId: assetId,
                                    x: root.canvas ? -root.canvas.pan.x / root.canvas.zoom + (root.canvas.width / 2 / root.canvas.zoom) : 0,
                                    y: root.canvas ? -root.canvas.pan.y / root.canvas.zoom + (root.canvas.height / 2 / root.canvas.zoom) : 0,
                                    rotation: 0,
                                    cornerRadius: 0
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
            onClicked: console.log("Import logic...")
        }
    }
}
