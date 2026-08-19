import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import "qrc:/qt/qml/DungeonEditor/qml/components"

Rectangle {
    id: root
    height: 36
    color: "#2b2b2b"
    border.color: "#1a1a1a"
    border.width: 1
    
    property var document: null
    property var canvas: null
    
    // Top highlight bevel
    Rectangle {
        anchors.top: parent.top
        width: parent.width
        height: 1
        color: "#3d3d3d"
    }

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 4
        spacing: 0
        
        DccButton {
            text: ""
            Layout.preferredWidth: 32
            Layout.preferredHeight: 28
            contentItem: AppIcon { icon: "general/settings"; size: 14; anchors.centerIn: parent }
        }

        MenuBar {
            id: menuBar
            Layout.alignment: Qt.AlignVCenter
            
            delegate: MenuBarItem {
                id: barItem
                contentItem: DccLabel {
                    text: barItem.text
                    font.pixelSize: 10
                    font.bold: true
                    color: barItem.highlighted ? "#f59e0b" : "#aaa"
                    verticalAlignment: Text.AlignVCenter
                    horizontalAlignment: Text.AlignHCenter
                }
                background: Rectangle {
                    color: barItem.highlighted ? "#3d3d3d" : "transparent"
                    radius: 1
                }
            }

            Menu {
                title: qsTr("FILE")
                MenuItem { text: qsTr("NEW"); onTriggered: document.clear() }
                MenuItem { text: qsTr("OPEN..."); onTriggered: openDialog.open() }
                MenuSeparator {}
                MenuItem { text: qsTr("SAVE"); onTriggered: {
                    if (document.dirty) saveDialog.open() 
                    else saveDialog.open()
                } }
                MenuItem { text: qsTr("SAVE AS..."); onTriggered: saveDialog.open() }
                MenuItem { text: qsTr("PREFERENCES"); onTriggered: preferencesDialog.open() }
                MenuSeparator {}
                MenuItem { text: qsTr("QUIT"); onTriggered: Qt.quit() }
            }
            Menu {
                title: qsTr("EDIT")
                MenuItem { text: qsTr("UNDO"); onTriggered: document.undo() }
                MenuItem { text: qsTr("REDO"); onTriggered: document.redo() }
            }
            Menu {
                title: qsTr("CORE")
                MenuItem { text: qsTr("LOAD TOOL") }
                MenuItem { text: qsTr("IMPORT") }
                MenuItem { text: qsTr("EXPORT") }
            }
            Menu {
                title: qsTr("WINDOW")
                MenuItem { text: qsTr("OUTLINER") }
                MenuItem { text: qsTr("ASSETS") }
                MenuItem { text: qsTr("AI CONSOLE") }
            }
        }

        Item { Layout.fillWidth: true }
        
        RowLayout {
            Layout.rightMargin: 8
            spacing: 8
            
            DccLabel { text: "WORKSPACE:"; color: "#666"; font.pixelSize: 9; font.bold: true }
            
            ComboBox {
                model: ["CORE", "SCULPT", "PAINT", "AI"]
                flat: true
                Layout.preferredHeight: 22
                font.pixelSize: 10
                contentItem: DccLabel {
                    text: parent.displayText
                    verticalAlignment: Text.AlignVCenter
                    leftPadding: 8
                }
                background: Rectangle { color: "#1a1a1a"; border.color: "#383838" }
            }
        }
    }
}
