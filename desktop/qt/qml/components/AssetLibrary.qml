import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import DungeonEditor.components

/** Asset Library UI Component */

DccPanel {
    id: root
    
    property var assetModel: null
    property var document: null
    property var canvas: null
    
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 10
        
        DccLabel {
            text: qsTr("ASSET LIBRARY")
            font.bold: true
            color: "#f59e0b"
        }
        
        DccTextField {
            id: searchField
            placeholderText: qsTr("Search assets...")
            Layout.fillWidth: true
            onTextChanged: root.assetModel.searchQuery = text
        }
        
        ScrollView {
            Layout.fillWidth: true
            Layout.preferredHeight: 32
            ScrollBar.vertical.policy: ScrollBar.AlwaysOff
            RowLayout {
                spacing: 4
                Repeater {
                    model: ["All", "Weapons", "Armor", "Bosses", "Architecture", "Environment"]
                    DccButton {
                        text: modelData
                        flat: true
                        font.pixelSize: 9
                        highlighted: root.assetModel.activeCategory === modelData
                        onClicked: root.assetModel.activeCategory = modelData
                    }
                }
            }
        }

        GridView {
            id: grid
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            cellWidth: grid.width / 3
            cellHeight: 90
            model: root.assetModel
            
            delegate: Item {
                width: grid.cellWidth
                height: 90
                
                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 4
                    
                    Rectangle {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        color: "#151515"
                        radius: 2
                        border.color: mouseArea.containsMouse ? "#f59e0b" : "#333"
                        border.width: 1
                        
                        Image {
                            anchors.fill: parent
                            anchors.margins: 4
                            source: icon ? icon : ""
                            fillMode: Image.PreserveAspectFit
                            visible: icon !== ""
                        }
                        
                        DccLabel {
                            anchors.centerIn: parent
                            text: name[0]
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
                    
                    DccLabel {
                        text: name
                        font.pixelSize: 9
                        Layout.fillWidth: true
                        horizontalAlignment: Text.AlignHCenter
                        elide: Text.ElideRight
                    }
                }
            }
        }
        
        DccButton {
            text: qsTr("IMPORT ASSET...")
            Layout.fillWidth: true
            onClicked: console.log("Import logic...")
        }
    }
}
