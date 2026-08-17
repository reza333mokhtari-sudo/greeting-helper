import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

Rectangle {
    id: root
    color: "#252526"
    
    property var document: null
    property var canvas: null
    property var assetModel: null

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        // Adobe-style Sidebar and Search
        RowLayout {
            Layout.fillWidth: true
            Layout.margins: 10
            spacing: 8
            TextField {
                placeholderText: qsTr("Search Assets...")
                Layout.fillWidth: true
                background: Rectangle { color: "#1e1e1e"; radius: 4; border.color: "#3e3e42" }
                color: "white"
            }
            ToolButton { text: "Filter" }
        }

        SplitView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            orientation: Qt.Horizontal

            // Categories
            Rectangle {
                SplitView.preferredWidth: 100
                color: "#1e1e1e"
                ListView {
                    anchors.fill: parent
                    model: ["All", "Rooms", "Doors", "Props", "NPCs", "Traps"]
                    delegate: ItemDelegate {
                        width: parent.width
                        text: modelData
                        font.pixelSize: 11
                    }
                }
            }

            // Grid View
            ScrollView {
                SplitView.fillWidth: true
                clip: true
                
                GridView {
                    id: assetGrid
                    width: parent.width
                    cellWidth: 80
                    cellHeight: 100
                    model: 20 // Dummy items
                    delegate: Item {
                        width: 80; height: 100
                        Column {
                            anchors.centerIn: parent
                            Rectangle {
                                width: 64; height: 64; radius: 4; color: "#333"
                                Label { anchors.centerIn: parent; text: "📦"; font.pixelSize: 24 }
                                border.color: hoveredAsset.hovered ? "#3b82f6" : "transparent"
                                HoverHandler { id: hoveredAsset }
                            }
                            Label {
                                text: "Prop " + index
                                font.pixelSize: 10
                                color: "#aaa"
                                horizontalAlignment: Text.AlignHCenter
                                width: 64
                            }
                        }
                    }
                }
            }
        }

        // Actions
        RowLayout {
            Layout.fillWidth: true
            Layout.margins: 4
            spacing: 4
            Button { text: qsTr("Import"); Layout.fillWidth: true; font.pixelSize: 11 }
            Button { text: qsTr("Collection"); Layout.fillWidth: true; font.pixelSize: 11 }
        }
    }
}
