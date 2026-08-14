import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    id: root
    height: 40
    color: "#2d2d2d"
    border.color: "#3e3e42"
    
    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 10
        anchors.rightMargin: 10
        spacing: 15
        
        RowLayout {
            spacing: 5
            ToolButton {
                icon.name: "document-new"
                text: qsTr("New")
                onClicked: mapDocument.clear()
            }
            ToolButton {
                icon.name: "document-open"
                text: qsTr("Open")
                onClicked: mapDocument.load("map.json")
            }
            ToolButton {
                icon.name: "document-save"
                text: qsTr("Save")
                onClicked: mapDocument.save("map.json")
            }
        }
        
        ToolSeparator {}
        
        RowLayout {
            spacing: 5
            ToolButton {
                text: qsTr("Undo")
                enabled: mapDocument.undoStack.canUndo
                onClicked: mapDocument.undoStack.undo()
            }
            ToolButton {
                text: qsTr("Redo")
                enabled: mapDocument.undoStack.canRedo
                onClicked: mapDocument.undoStack.redo()
            }
        }
        
        Item { Layout.fillWidth: true }
        
        RowLayout {
            spacing: 5
            Label { text: mapDocument.dirty ? qsTr("Unsaved Changes*") : qsTr("Saved"); color: mapDocument.dirty ? "#f1c40f" : "#2ecc71" }
            ToolButton {
                text: qsTr("Admin")
                onClicked: console.log("Open Admin View")
            }
        }
    }
}
