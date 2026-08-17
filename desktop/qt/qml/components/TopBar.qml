import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import QtQuick.Dialogs
import DungeonEditor.Core 1.0

/**
 * Native Top Bar - Professional Dungeon Scrawl Aesthetic
 */
Rectangle {
    id: root
    height: 56 // h-14 equivalent
    color: "#121212"
    
    property var document: null
    property var canvas: null
    
    Rectangle {
        anchors.bottom: parent.bottom
        width: parent.width
        height: 1
        color: "#2d2d2d"
    }

    FileDialog {
        id: saveDialog
        title: "Save Map"
        fileMode: FileDialog.SaveFile
        nameFilters: ["Map files (*.json)"]
        onAccepted: document.save(selectedFile)
    }

    FileDialog {
        id: openDialog
        title: "Open Map"
        fileMode: FileDialog.OpenFile
        nameFilters: ["Map files (*.json)"]
        onAccepted: document.load(selectedFile)
    }

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 16
        anchors.rightMargin: 16
        spacing: 12
        
        // Brand Area
        RowLayout {
            spacing: 10
            Layout.alignment: Qt.AlignVCenter
            
            Rectangle {
                width: 28; height: 28; radius: 4
                color: "#3b82f6" // Primary
                Label {
                    anchors.centerIn: parent
                    text: "M"
                    color: "white"
                    font.bold: true
                }
            }
            
            Label {
                text: "DUNGEON SCRAWL"
                color: "white"
                font.pixelSize: 14
                font.bold: true
                font.letterSpacing: 0.5
            }
        }

        Rectangle { width: 1; height: 24; color: "#333"; Layout.leftMargin: 8; Layout.rightMargin: 8 }

        // Menu Bar
        MenuBar {
            id: menuBar
            Layout.alignment: Qt.AlignVCenter
            background: Item {}
            
            Menu {
                title: qsTr("File")
                MenuItem { text: qsTr("New Map"); onTriggered: document.clear() }
                MenuItem { text: qsTr("Open..."); onTriggered: openDialog.open() }
                MenuSeparator {}
                MenuItem { text: qsTr("Save"); onTriggered: saveDialog.open() }
                MenuItem { text: qsTr("Export PNG") }
            }
            Menu {
                title: qsTr("Edit")
                MenuItem { text: qsTr("Undo"); enabled: document && document.canUndo; onTriggered: document.undoStack.undo() }
                MenuItem { text: qsTr("Redo"); enabled: document && document.canRedo; onTriggered: document.undoStack.redo() }
            }
            Menu {
                title: qsTr("View")
                MenuItem { text: qsTr("Zoom In"); onTriggered: canvas.zoomIn() }
                MenuItem { text: qsTr("Zoom Out"); onTriggered: canvas.zoomOut() }
                MenuItem { text: qsTr("Fit to Screen"); onTriggered: canvas.fitToScreen() }
            }
        }

        Item { Layout.fillWidth: true }
        
        // Status & User
        RowLayout {
            spacing: 16
            
            RowLayout {
                spacing: 6
                Rectangle {
                    width: 8; height: 8; radius: 4
                    color: (document && document.dirty) ? "#f59e0b" : "#10b981"
                }
                Label {
                    text: (document && document.dirty) ? "UNSAVED" : "SYNCED"
                    color: (document && document.dirty) ? "#f59e0b" : "#10b981"
                    font.pixelSize: 10
                    font.bold: true
                }
            }
            
            Button {
                text: "Sign In"
                flat: true
                contentItem: Label {
                    text: parent.text
                    color: "#3b82f6"
                    font.bold: true
                    font.pixelSize: 12
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
            }
            
            Button {
                text: "Export"
                background: Rectangle {
                    implicitWidth: 80
                    implicitHeight: 32
                    radius: 6
                    color: "#3b82f6"
                }
                contentItem: Label {
                    text: parent.text
                    color: "white"
                    font.bold: true
                    font.pixelSize: 12
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
            }
        }
    }
}
