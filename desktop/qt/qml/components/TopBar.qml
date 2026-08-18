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
    height: 36
    color: "#2d2d2d"
    
    property var document: null
    property var canvas: null
    
    Rectangle {
        anchors.bottom: parent.bottom
        width: parent.width
        height: 1
        color: "#1e1e1e"
    }

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 8
        spacing: 0
        
        Image {
            source: "qrc:/qt/qml/DungeonEditor/assets/icons/general/settings.svg"
            sourceSize.width: 16
            sourceSize.height: 16
            Layout.alignment: Qt.AlignVCenter
            Layout.rightMargin: 8
        }


        MenuBar {
            id: menuBar
            Layout.alignment: Qt.AlignVCenter
            
            delegate: MenuBarItem {
                id: barItem
                contentItem: Label {
                    text: barItem.text
                    font.pixelSize: 11
                    color: barItem.highlighted ? "white" : "#ccc"
                    verticalAlignment: Text.AlignVCenter
                }
            }


            Menu {
                title: qsTr("File")
                MenuItem { text: qsTr("New"); icon.source: "qrc:/qt/qml/DungeonEditor/assets/icons/menu/new.svg"; onTriggered: document.clear() }
                MenuItem { text: qsTr("Open..."); icon.source: "qrc:/qt/qml/DungeonEditor/assets/icons/menu/open.svg"; onTriggered: openDialog.open() }

                MenuSeparator {}
                MenuItem { text: qsTr("Save"); icon.source: "qrc:/qt/qml/DungeonEditor/assets/icons/menu/save.svg"; onTriggered: document.save() }
                MenuItem { text: qsTr("Preferences..."); onTriggered: preferencesDialog.open() }
                MenuSeparator {}
                MenuItem { text: qsTr("Quit"); onTriggered: Qt.quit() }
            }
            Menu {
                title: qsTr("Edit")
                MenuItem { 
                    text: qsTr("Undo")
                    shortcut: StandardKey.Undo
                    onTriggered: document.undo() 
                }
                MenuItem { 
                    text: qsTr("Redo")
                    shortcut: StandardKey.Redo
                    onTriggered: document.redo() 
                }
            }
            Menu {
                title: qsTr("Modify")
                MenuItem { text: qsTr("Reset Transformations") }
            }
            Menu {
                title: qsTr("Create")
                MenuItem { text: qsTr("Polygon Primitive") }
            }
            Menu {
                title: qsTr("Windows")
                MenuItem { text: qsTr("Outliner") }
                MenuItem { text: qsTr("Asset Browser") }
                MenuItem { text: qsTr("Attributes Editor") }
            }
            Menu {
                title: qsTr("Help")
                MenuItem { text: qsTr("Welcome Screen"); onTriggered: welcomeWindow.show() }
                MenuItem { text: qsTr("Documentation"); onTriggered: helpWindow.show() }
                MenuItem { text: qsTr("License Management..."); onTriggered: licenseWindow.show() }
                MenuSeparator {}
                MenuItem { text: qsTr("Check for Updates...") }
                MenuItem { text: qsTr("About Dungeon Scrawl"); onTriggered: aboutWindow.show() }
            }
        }

        Item { Layout.fillWidth: true }
        
        RowLayout {
            Layout.rightMargin: 8
            spacing: 12
            
            ComboBox {
                model: ["Default Workspace", "Maya Classic", "Expert"]
                flat: true
                Layout.preferredHeight: 24
            }
            
            AppIcon { icon: "status/help"; size: 16; color: "#888" }
        }
    }
}
