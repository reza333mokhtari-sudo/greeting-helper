import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import DungeonEditor.components

BaseFloatingWindow {
    id: welcomeWindow
    title: "WELCOME"
    width: 800
    height: 500
    
    ColumnLayout {
        anchors.fill: parent
        spacing: 0
        
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 180
            color: "#161616"
            
            ColumnLayout {
                anchors.centerIn: parent
                spacing: 10
                
                Image {
                    source: "qrc:/qt/qml/DungeonEditor/assets/icon.png"
                    Layout.preferredWidth: 64
                    Layout.preferredHeight: 64
                    Layout.alignment: Qt.AlignHCenter
                }

                DccLabel {
                    text: "DUNGEON SCRAWL"
                    font.pixelSize: 28
                    font.bold: true
                    color: "#f59e0b"
                    Layout.alignment: Qt.AlignHCenter
                }
                
                DccLabel {
                    text: "CORE ENGINE V1.0.4 PROFESSIONAL"
                    font.pixelSize: 10
                    color: "#666"
                    Layout.alignment: Qt.AlignHCenter
                }
            }
        }
        
        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 0
            
            // Recent Files
            DccPanel {
                Layout.fillHeight: true
                Layout.preferredWidth: 300
                color: "#0f0f0f"
                
                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    
                    DccLabel {
                        text: "RECENT MAPS"
                        font.bold: true
                        color: "#888"
                    }
                    
                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: ["Dungeon of Doom.ds", "Crystal Cave.ds", "Abandoned Outpost.ds"]
                        delegate: ItemDelegate {
                            width: parent.width
                            contentItem: DccLabel {
                                text: modelData
                                color: hovered ? "#f59e0b" : "#ccc"
                            }
                            background: Rectangle { color: hovered ? "#1a1a1a" : "transparent" }
                        }
                    }
                }
            }
            
            // Quick Start
            Rectangle {
                Layout.fillHeight: true
                Layout.fillWidth: true
                color: "#0a0a0a"
                
                GridLayout {
                    anchors.fill: parent
                    anchors.margins: 40
                    columns: 2
                    rowSpacing: 20
                    columnSpacing: 20
                    
                    DccButton {
                        text: "NEW MAP"
                        Layout.fillWidth: true
                        Layout.preferredHeight: 80
                        onClicked: { welcomeWindow.close(); if(mapDoc) mapDoc.clear(); }
                    }
                    
                    DccButton {
                        text: "OPEN MAP..."
                        Layout.fillWidth: true
                        Layout.preferredHeight: 80
                    }
                    
                    DccButton {
                        text: "OPEN EXAMPLE"
                        Layout.fillWidth: true
                        Layout.preferredHeight: 80
                    }
                    
                    DccButton {
                        text: "LEARN MORE"
                        Layout.fillWidth: true
                        Layout.preferredHeight: 80
                    }
                }
            }
        }
        
        DccPanel {
            Layout.fillWidth: true
            height: 40
            color: "#161616"
            
            CheckBox {
                anchors.left: parent.left
                anchors.leftMargin: 20
                anchors.verticalCenter: parent.verticalCenter
                text: "Don't show this screen on startup"
                contentItem: DccLabel {
                    text: parent.text
                    color: "#666"
                    leftPadding: parent.indicator.width + parent.spacing
                    verticalAlignment: Text.AlignVCenter
                }
            }
        }
    }
}
