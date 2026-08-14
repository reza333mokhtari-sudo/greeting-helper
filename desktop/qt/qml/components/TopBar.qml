import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import QtQuick.Dialogs

/**
 * Native Top Bar
 */

Rectangle {
    id: root
    height: 48
    color: "#1e1e1e"
    border.color: "#333333"
    
    property var document: null
    property var canvas: null
    
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
        anchors.leftMargin: 15
        anchors.rightMargin: 15
        spacing: 20
        
        Label {
            text: "DUNGEON SCRAWL"
            color: "#e0e0e0"
            font.pixelSize: 14
            font.bold: true
            Layout.alignment: Qt.AlignVCenter
        }

        ToolSeparator { orientation: Qt.Vertical; padding: 10 }

        RowLayout {
            spacing: 2
            ToolButton { 
                icon.name: "document-new"
                text: "New"
                onClicked: document.clear() 
                display: AbstractButton.TextUnderIcon
            }
            ToolButton { 
                icon.name: "document-open"
                text: "Open"
                onClicked: openDialog.open() 
                display: AbstractButton.TextUnderIcon
            }
            ToolButton { 
                icon.name: "document-save"
                text: "Save"
                onClicked: saveDialog.open() 
                display: AbstractButton.TextUnderIcon
            }
        }
        
        ToolSeparator { orientation: Qt.Vertical; padding: 10 }
        
        RowLayout {
            spacing: 2
            ToolButton {
                text: "Undo"
                icon.name: "edit-undo"
                enabled: document && document.canUndo
                onClicked: document.undoStack.undo()
                display: AbstractButton.TextUnderIcon
            }
            ToolButton {
                text: "Redo"
                icon.name: "edit-redo"
                enabled: document && document.canRedo
                onClicked: document.undoStack.redo()
                display: AbstractButton.TextUnderIcon
            }
        }
        
        Item { Layout.fillWidth: true }
        
        RowLayout {
            spacing: 10
            Rectangle {
                width: 8; height: 8; radius: 4
                color: (document && document.dirty) ? "#f1c40f" : "#2ecc71"
                Layout.alignment: Qt.AlignVCenter
            }
            Label { 
                text: (document && document.dirty) ? qsTr("UNSAVED") : qsTr("SYNCED")
                color: (document && document.dirty) ? "#f1c40f" : "#2ecc71"
                font.pixelSize: 10
                font.bold: true
                Layout.alignment: Qt.AlignVCenter
            }
            
            Button {
                text: "Export"
                palette.button: "#007acc"
                palette.buttonText: "white"
                font.bold: true
            }
        }
    }
}
