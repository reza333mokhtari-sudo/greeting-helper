import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

Rectangle {
    id: root
    height: 120
    color: "#1e1e1e"
    
    property var document: null
    property var canvas: null

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        // Status Line (Quick Actions)
        RowLayout {
            Layout.fillWidth: true
            Layout.preferredHeight: 32
            Layout.leftMargin: 10
            spacing: 8

            Button {
                text: "New"
                flat: true
                font.pixelSize: 11
                palette.buttonText: "#aaa"
                onClicked: document.clear()
            }
            Button {
                text: "Open"
                flat: true
                font.pixelSize: 11
                palette.buttonText: "#aaa"
            }
            Button {
                text: "Save"
                flat: true
                font.pixelSize: 11
                palette.buttonText: "#aaa"
            }

            Rectangle { width: 1; height: 16; color: "#3e3e42" }

            // Selection Modes
            RowLayout {
                spacing: 4
                ToolButton { text: "Obj"; checkable: true; checked: true }
                ToolButton { text: "Comp"; checkable: true }
            }

            Rectangle { width: 1; height: 16; color: "#3e3e42" }

            // Snapping
            RowLayout {
                spacing: 4
                ToolButton { 
                    text: "Grid"
                    checkable: true
                    checked: document ? document.snapEnabled : true
                    onToggled: if (document) document.snapEnabled = checked
                }
            }

            Item { Layout.fillWidth: true }
        }

        // Shelf
        TabBar {
            id: shelfTabs
            Layout.fillWidth: true
            background: Rectangle { color: "#252526" }
            
            TabButton { text: qsTr("General") }
            TabButton { text: qsTr("Draw") }
            TabButton { text: qsTr("Props") }
            TabButton { text: qsTr("Procedural") }
            TabButton { text: qsTr("Fog") }
            TabButton { text: qsTr("Camera") }
            TabButton { text: qsTr("Help") }
        }

        StackLayout {
            currentIndex: shelfTabs.currentIndex
            Layout.fillWidth: true
            Layout.fillHeight: true

            // General Shelf
            RowLayout {
                Layout.leftMargin: 10
                spacing: 12
                ToolButton { 
                    contentItem: RowLayout {
                        AppIcon { icon: "status/history"; size: 20 }
                        Label { text: "History"; color: "#aaa"; font.pixelSize: 11 }
                    }
                }
                ToolButton { 
                    contentItem: RowLayout {
                        AppIcon { icon: "panels/layers"; size: 20 }
                        Label { text: "Outliner"; color: "#aaa"; font.pixelSize: 11 }
                    }
                }

                ToolButton { text: "CMS"; display: AbstractButton.TextUnderIcon }
            }

            // Draw Shelf
            RowLayout {
                Layout.leftMargin: 10
                spacing: 12
                ToolButton { text: "Room"; display: AbstractButton.TextUnderIcon }
                ToolButton { text: "Corridor"; display: AbstractButton.TextUnderIcon }
                ToolButton { text: "Wall"; display: AbstractButton.TextUnderIcon }
            }

            // Props Shelf
            RowLayout {
                Layout.leftMargin: 10
                spacing: 12
                ToolButton { text: "Place Prop"; onClicked: canvas.activeTool = "place_prop" }
                ToolButton { text: "Texture Brush"; onClicked: canvas.activeTool = "texture_brush" }
            }

            // Procedural Shelf
            RowLayout {
                Layout.leftMargin: 10
                spacing: 12
                ToolButton { text: "Generate All"; onClicked: shelfTabs.currentIndex = 3 }
            }

            // Fog Shelf
            RowLayout {
                Layout.leftMargin: 10
                spacing: 12
                ToolButton { text: "Fog Brush"; onClicked: canvas.activeTool = "fog_add" }
                ToolButton { text: "Clear Fog"; onClicked: canvas.activeTool = "fog_remove" }
            }

            // Camera Shelf
            RowLayout {
                Layout.leftMargin: 10
                spacing: 12
                ToolButton { text: "Orbit"; onClicked: canvas.activeTool = "camera_orbit" }
                ToolButton { text: "Measure"; onClicked: canvas.activeTool = "measure" }
            }

            // Help Shelf
            RowLayout {
                Layout.leftMargin: 10
                spacing: 12
                ToolButton { text: "Shortcuts" }
                ToolButton { text: "Docs" }
            }

        }

        // Bottom border
        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: "#3e3e42"
        }
    }
}
