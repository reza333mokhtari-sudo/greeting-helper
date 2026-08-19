import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import "qrc:/qt/qml/DungeonEditor/qml/components"

ZBrushPanel {
    id: root
    height: 100
    title: "SHELF"
    
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
            
            delegate: TabButton {
                id: tabBtn
                contentItem: ZBrushLabel {
                    text: tabBtn.text
                    font.pixelSize: 9
                    font.bold: true
                    color: tabBtn.checked ? "#f59e0b" : "#666"
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
                background: Rectangle {
                    color: tabBtn.checked ? "#2b2b2b" : "transparent"
                    border.color: tabBtn.checked ? "#383838" : "transparent"
                    border.width: 1
                }
            }

            TabButton { text: "GEOMETRY" }
            TabButton { text: "SCULPT" }
            TabButton { text: "PROPS" }
            TabButton { text: "AI DYNAMICS" }
            TabButton { text: "RENDER" }
        }

        Rectangle {
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
                    
                    ZBrushButton {
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
