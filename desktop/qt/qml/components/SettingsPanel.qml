import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    color: "#252526"
    property var document

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 15

        Label {
            text: qsTr("Editor Settings")
            color: "white"
            font.bold: true
        }

        GroupBox {
            title: qsTr("Grid")
            Layout.fillWidth: true
            palette.windowText: "white"
            
            ColumnLayout {
                CheckBox {
                    text: qsTr("Show Grid")
                    checked: document ? document.gridVisible : true
                    onToggled: document.gridVisible = checked
                    palette.windowText: "white"
                }
                CheckBox {
                    text: qsTr("Snap to Grid")
                    checked: document ? document.snapEnabled : true
                    onToggled: document.snapEnabled = checked
                    palette.windowText: "white"
                }
            }
        }

        GroupBox {
            title: qsTr("Canvas")
            Layout.fillWidth: true
            palette.windowText: "white"
            
            ColumnLayout {
                RowLayout {
                    Label { text: qsTr("Grid Size:"); color: "white" }
                    SpinBox { value: 50; editable: false }
                }
            }
        }

        Item { Layout.fillHeight: true }
    }
}
