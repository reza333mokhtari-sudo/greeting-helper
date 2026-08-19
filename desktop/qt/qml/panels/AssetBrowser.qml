import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import "qrc:/qt/qml/DungeonEditor/qml/components"

DccPanel {
    id: root
    
    property var document: null
    property var canvas: null
    property var assetModel: null

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        DccLabel {
            text: qsTr("ASSET BROWSER")
            font.bold: true
            color: "#f59e0b"
            Layout.margins: 8
            font.pixelSize: 10
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.margins: 4
            spacing: 8
            
            DccTextField {
                id: searchInput
                Layout.fillWidth: true
                placeholderText: qsTr("Search assets...")
                leftPadding: 24
                
                AppIcon {
                    anchors.left: parent.left
                    anchors.leftMargin: 6
                    anchors.verticalCenter: parent.verticalCenter
                    icon: "menu/open"
                    size: 14
                    color: "#666"
                }
            }
            
            DccButton {
                text: ""
                Layout.preferredWidth: 24
                Layout.preferredHeight: 24
                contentItem: AppIcon { icon: "general/settings"; size: 14; anchors.centerIn: parent }
                ToolTip.visible: hovered; ToolTip.text: qsTr("Grid Settings")
            }
        }

        SplitView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            orientation: Qt.Horizontal
            
            handle: Rectangle { implicitWidth: 1; color: "#222222" }

            // Categories (Sidebar)
            Rectangle {
                SplitView.preferredWidth: 100
                color: "#1e1e1e"
                ListView {
                    anchors.fill: parent
                    model: [
                        { name: "ALL", icon: "panels/asset_library" },
                        { name: "ROOMS", icon: "tools/draw_room" },
                        { name: "PROPS", icon: "tools/place_prop" },
                        { name: "TILES", icon: "tools/texture_brush" },
                        { name: "RECENT", icon: "status/history" }
                    ]
                    delegate: ItemDelegate {
                        width: parent.width
                        height: 32
                        contentItem: RowLayout {
                            spacing: 8
                            anchors.leftMargin: 8
                            AppIcon { icon: modelData.icon; size: 12; active: hovered }
                            DccLabel {
                                text: modelData.name
                                font.pixelSize: 9
                                font.bold: true
                                color: hovered ? "#f59e0b" : "#999"
                            }
                        }
                        background: Rectangle {
                            color: hovered ? "#2d2d2d" : "transparent"
                        }
                    }
                }
            }

            // Asset Grid
            DccPanel {
                SplitView.fillWidth: true
                color: "#161616"
                
                ScrollView {
                    anchors.fill: parent
                    clip: true
                    
                    GridView {
                        id: assetGrid
                        width: parent.width
                        cellWidth: 80
                        cellHeight: 90
                        model: 30
                        delegate: Item {
                            width: 80; height: 90
                            ColumnLayout {
                                anchors.centerIn: parent
                                spacing: 4
                                
                                Rectangle {
                                    Layout.preferredWidth: 64
                                    Layout.preferredHeight: 64
                                    color: hoveredAsset.hovered ? "#333333" : "#1e1e1e"
                                    border.color: hoveredAsset.hovered ? "#f59e0b" : "#2d2d2d"
                                    border.width: 1
                                    radius: 1
                                    
                                    AppIcon {
                                        anchors.centerIn: parent
                                        icon: "tools/place_prop"
                                        size: 28
                                        opacity: 0.6
                                    }
                                    
                                    HoverHandler { id: hoveredAsset }
                                }
                                
                                DccLabel {
                                    text: "PROP_" + (index + 1)
                                    Layout.preferredWidth: 64
                                    horizontalAlignment: Text.AlignHCenter
                                    font.pixelSize: 9
                                    color: hoveredAsset.hovered ? "#f59e0b" : "#666"
                                    elide: Text.ElideRight
                                }
                            }
                            
                            MouseArea {
                                anchors.fill: parent
                                onClicked: console.log("Selected asset", index)
                                onDoubleClicked: console.log("Placed asset", index)
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
            DccButton { text: qsTr("IMPORT"); Layout.fillWidth: true }
            DccButton { text: qsTr("BROWSE"); Layout.fillWidth: true }
        }
    }
}
