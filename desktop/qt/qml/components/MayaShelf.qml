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
                ToolButton { text: "History"; display: AbstractButton.TextUnderIcon }
                ToolButton { text: "Outliner"; display: AbstractButton.TextUnderIcon }
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

            // Other shelves placeholders
            Repeater {
                model: 5
                RowLayout {
                    Layout.leftMargin: 10
                    Label { text: "Shelf category items..."; color: "#666" }
                }
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
