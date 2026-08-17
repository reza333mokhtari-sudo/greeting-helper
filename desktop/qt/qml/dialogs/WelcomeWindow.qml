import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "../components"

BaseFloatingWindow {
    id: welcomeWindow
    title: "Welcome to Dungeon Scrawl"
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
                    source: "qrc:/assets/icon.png"
                    Layout.preferredWidth: 64
                    Layout.preferredHeight: 64
                    Layout.alignment: Qt.AlignHCenter
                }

                
                Label {
                    text: "DUNGEON SCRAWL"
                    font.pixelSize: 24
                    font.bold: true
                    color: "#3b82f6"
                    Layout.alignment: Qt.AlignHCenter
                }
                
                Label {
                    text: "Version 1.0.4 Professional"
                    font.pixelSize: 12
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
            Rectangle {
                Layout.fillHeight: true
                Layout.preferredWidth: 300
                color: "#0f0f0f"
                border.color: "#1e1e1e"
                
                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    
                    Label {
                        text: "Recent Maps"
                        font.bold: true
                        color: "#888"
                    }
                    
                    ListView {
                        Layout.fillWidth: true
                        Layout.fillHeight: true
                        model: ["Dungeon of Doom.ds", "Crystal Cave.ds", "Abandoned Outpost.ds"]
                        delegate: ItemDelegate {
                            width: parent.width
                            contentItem: Label {
                                text: modelData
                                color: hovered ? "#3b82f6" : "#ccc"
                            }
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
                    
                    Button {
                        text: "New Map"
                        Layout.fillWidth: true
                        Layout.preferredHeight: 80
                        onClicked: { welcomeWindow.close(); mapDoc.clear(); }
                    }
                    
                    Button {
                        text: "Open Map..."
                        Layout.fillWidth: true
                        Layout.preferredHeight: 80
                    }
                    
                    Button {
                        text: "Open Example"
                        Layout.fillWidth: true
                        Layout.preferredHeight: 80
                    }
                    
                    Button {
                        text: "Learn More"
                        Layout.fillWidth: true
                        Layout.preferredHeight: 80
                    }
                }
            }
        }
        
        Rectangle {
            Layout.fillWidth: true
            height: 40
            color: "#161616"
            
            CheckBox {
                anchors.left: parent.left
                anchors.leftMargin: 20
                anchors.verticalCenter: parent.verticalCenter
                text: "Don't show this screen on startup"
                contentItem: Label {
                    text: parent.text
                    color: "#888"
                    leftPadding: parent.indicator.width + parent.spacing
                    verticalAlignment: Text.AlignVCenter
                }
            }
        }
    }
}
