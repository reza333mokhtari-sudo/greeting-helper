import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import QtQuick.Dialogs

/**
 * Native Top Bar
 */

Rectangle {
    id: root
    height: 40
    color: "#2d2d2d"
    border.color: "#3e3e42"
    
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
        anchors.leftMargin: 10
        anchors.rightMargin: 10
        spacing: 15
        
        RowLayout {
            spacing: 5
            ToolButton { text: "New"; onClicked: document.clear() }
            ToolButton { text: "Open"; onClicked: openDialog.open() }
            ToolButton { text: "Save"; onClicked: saveDialog.open() }
        }
        
        ToolSeparator {}
        
        RowLayout {
            spacing: 5
            ToolButton {
                text: "Undo"
                enabled: document && document.canUndo
                onClicked: document.undoStack.undo()
            }
            ToolButton {
                text: "Redo"
                enabled: document && document.canRedo
                onClicked: document.undoStack.redo()
            }
        }
        
        Item { Layout.fillWidth: true }
        
        RowLayout {
            spacing: 5
            Label { 
                text: (document && document.dirty) ? qsTr("Unsaved Changes*") : qsTr("Saved")
                color: (document && document.dirty) ? "#f1c40f" : "#2ecc71" 

            }
        }
    }
}
