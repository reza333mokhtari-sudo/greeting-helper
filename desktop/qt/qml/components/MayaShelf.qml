import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import DungeonEditor.components

DccPanel {
    id: root
    height: 100
    
    property var document: null
    property var canvas: null

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        TabBar {
            id: shelfTabs
            Layout.fillWidth: true
            height: 24
            background: Rectangle { color: "#1a1a1a" }
            
            TabButton { 
                text: "GEOMETRY"
                contentItem: DccLabel {
                    text: parent.text
                    font.pixelSize: 9
                    font.bold: true
                    color: parent.checked ? "#f59e0b" : "#666"
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
                background: Rectangle {
                    color: parent.checked ? "#2b2b2b" : "transparent"
                    border.color: parent.checked ? "#383838" : "transparent"
                    border.width: 1
                }
            }
            TabButton { 
                text: "SCULPT"
                contentItem: DccLabel {
                    text: parent.text
                    font.pixelSize: 9
                    font.bold: true
                    color: parent.checked ? "#f59e0b" : "#666"
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
                background: Rectangle {
                    color: parent.checked ? "#2b2b2b" : "transparent"
                    border.color: parent.checked ? "#383838" : "transparent"
                    border.width: 1
                }
            }
            TabButton { 
                text: "PROPS"
                contentItem: DccLabel {
                    text: parent.text
                    font.pixelSize: 9
                    font.bold: true
                    color: parent.checked ? "#f59e0b" : "#666"
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
                background: Rectangle {
                    color: parent.checked ? "#2b2b2b" : "transparent"
                    border.color: parent.checked ? "#383838" : "transparent"
                    border.width: 1
                }
            }
            TabButton { 
                text: "AI DYNAMICS"
                contentItem: DccLabel {
                    text: parent.text
                    font.pixelSize: 9
                    font.bold: true
                    color: parent.checked ? "#f59e0b" : "#666"
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
                background: Rectangle {
                    color: parent.checked ? "#2b2b2b" : "transparent"
                    border.color: parent.checked ? "#383838" : "transparent"
                    border.width: 1
                }
            }
            TabButton { 
                text: "RENDER"
                contentItem: DccLabel {
                    text: parent.text
                    font.pixelSize: 9
                    font.bold: true
                    color: parent.checked ? "#f59e0b" : "#666"
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
                background: Rectangle {
                    color: parent.checked ? "#2b2b2b" : "transparent"
                    border.color: parent.checked ? "#383838" : "transparent"
                    border.width: 1
                }
            }
        }

        DccPanel {
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: "#2b2b2b"
            
            RowLayout {
                anchors.fill: parent
                anchors.margins: 8
                spacing: 12

                Repeater {
                    model: shelfTabs.currentIndex === 0 ? ["Room", "Corridor", "Wall", "Block"] : 
                           shelfTabs.currentIndex === 2 ? ["Tree", "Crate", "Barrel", "Chest"] : []
                    
                    DccButton {
                        text: modelData.toUpperCase()
                        Layout.preferredHeight: 40
                        Layout.preferredWidth: 80
                    }
                }
                
                Item { Layout.fillWidth: true }
            }
        }
    }
}
