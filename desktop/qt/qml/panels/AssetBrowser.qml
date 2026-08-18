import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import "qrc:/qml/components"

Rectangle {
    id: root
    color: "#252526"
    
    property var document: null
    property var canvas: null
    property var assetModel: null

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        RowLayout {
            Layout.fillWidth: true
            Layout.margins: 12
            spacing: 8
            
            Rectangle {
                Layout.fillWidth: true
                height: 32
                color: "#161616"
                radius: 4
                border.color: "#3e3e42"
                
                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 8
                    anchors.rightMargin: 8
                    AppIcon { icon: "menu/open"; size: 14; color: "#666" }
                    TextInput {
                        Layout.fillWidth: true
                        color: "white"
                        font.pixelSize: 12
                        placeholderText: qsTr("Search assets...")
                    }
                }
            }
            
            ToolButton {
                icon.source: "qrc:/assets/icons/general/settings.svg"
                ToolTip.visible: hovered; ToolTip.text: qsTr("Grid Settings")
            }
        }

        SplitView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            orientation: Qt.Horizontal
            
            handle: Rectangle { implicitWidth: 1; color: "#2d2d2d" }

            // Categories (Sidebar)
            Rectangle {
                SplitView.preferredWidth: 120
                color: "#161616"
                ListView {
                    anchors.fill: parent
                    model: [
                        { name: "Favorites", icon: "status/history" },
                        { name: "All Assets", icon: "panels/asset_library" },
                        { name: "Rooms", icon: "tools/draw_room" },
                        { name: "Props", icon: "tools/place_prop" },
                        { name: "Textures", icon: "tools/texture_brush" }
                    ]
                    delegate: ItemDelegate {
                        width: parent.width
                        height: 36
                        contentItem: RowLayout {
                            spacing: 8
                            AppIcon { icon: modelData.icon; size: 14; active: hovered }
                            Label {
                                text: modelData.name
                                font.pixelSize: 11
                                color: hovered ? "white" : "#aaa"
                            }
                        }
                        background: Rectangle {
                            color: hovered ? "#2d2d2d" : "transparent"
                        }
                    }
                }
            }

            // Asset Grid
            ScrollView {
                SplitView.fillWidth: true
                clip: true
                
                GridView {
                    id: assetGrid
                    width: parent.width
                    cellWidth: 100
                    cellHeight: 120
                    model: 30
                    delegate: Item {
                        width: 100; height: 120
                        ColumnLayout {
                            anchors.centerIn: parent
                            spacing: 4
                            
                            Rectangle {
                                Layout.preferredWidth: 80
                                Layout.preferredHeight: 80
                                radius: 4
                                color: hoveredAsset.hovered ? "#2d2d2d" : "#1e1e1e"
                                border.color: hoveredAsset.hovered ? "#3b82f6" : "#333"
                                border.width: 1
                                
                                AppIcon {
                                    anchors.centerIn: parent
                                    icon: "tools/place_prop"
                                    size: 32
                                    opacity: 0.7
                                }
                                
                                HoverHandler { id: hoveredAsset }
                                
                                // Preview on hover logic would go here
                            }
                            
                            Label {
                                text: "Asset " + (index + 1)
                                Layout.preferredWidth: 80
                                horizontalAlignment: Text.AlignHCenter
                                font.pixelSize: 10
                                color: hoveredAsset.hovered ? "white" : "#888"
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
