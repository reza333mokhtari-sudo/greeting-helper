import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import QtQuick.Dialogs

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    id: root
    height: 40
    color: "#2d2d2d"
    border.color: "#3e3e42"
    
    FileDialog {
        id: saveDialog
        title: "Save Map"
        fileMode: FileDialog.SaveFile
        nameFilters: ["Map files (*.json)"]
        onAccepted: mapDocument.save(selectedFile)
    }

    FileDialog {
        id: openDialog
        title: "Open Map"
        fileMode: FileDialog.OpenFile
        nameFilters: ["Map files (*.json)"]
        onAccepted: mapDocument.load(selectedFile)
    }

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 10
        anchors.rightMargin: 10
        spacing: 15
        
        RowLayout {
            spacing: 5
            ToolButton { text: "New"; onClicked: mapDocument.clear() }
            ToolButton { text: "Open"; onClicked: openDialog.open() }
            ToolButton { text: "Save"; onClicked: saveDialog.open() }
        }
        
        ToolSeparator {}
        
        RowLayout {
            spacing: 5
            ToolButton {
                text: "Undo"
                enabled: mapDocument.undoStack.canUndo
                onClicked: mapDocument.undoStack.undo()
            }
            ToolButton {
                text: "Redo"
                enabled: mapDocument.undoStack.canRedo
                onClicked: mapDocument.undoStack.redo()
            }
        }
        
        Item { Layout.fillWidth: true }
        
        RowLayout {
            spacing: 5
            Label { 
                text: mapDocument.dirty ? qsTr("Unsaved Changes*") : qsTr("Saved")
                color: mapDocument.dirty ? "#f1c40f" : "#2ecc71" 
            }
        }
    }
}
