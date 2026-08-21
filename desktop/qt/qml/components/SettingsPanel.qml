import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import DungeonEditor.components

DccPanel {
    property var document: null

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 15

        DccLabel {
            text: qsTr("EDITOR SETTINGS")
            font.bold: true
            color: "#f59e0b"
        }

        DccPanel {
            Layout.fillWidth: true
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 4
                DccLabel { text: qsTr("GRID"); font.bold: true; color: "#888" }
                
                CheckBox {
                    text: qsTr("Show Grid")
                    checked: !!(document && document.gridVisible)
                    onToggled: if (document) document.gridVisible = checked
                }
                CheckBox {
                    text: qsTr("Snap to Grid")
                    checked: !!(document && document.snapEnabled)
                    onToggled: if (document) document.snapEnabled = checked
                }
            }
        }

        DccPanel {
            Layout.fillWidth: true
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 4
                DccLabel { text: qsTr("CANVAS"); font.bold: true; color: "#888" }
                
                RowLayout {
                    DccLabel { text: qsTr("Grid Size:") }
                    SpinBox { value: 50; editable: false; Layout.preferredHeight: 22 }
                }
            }
        }

        Item { Layout.fillHeight: true }
    }
}
