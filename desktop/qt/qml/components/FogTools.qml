import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "qrc:/qt/qml/DungeonEditor/qml/components"

DccPanel {
    property var document: null
    property var canvas: null

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 15
        spacing: 15

        DccLabel {
            text: qsTr("FOG & ENVIRONMENT")
            font.bold: true
            color: "#f59e0b"
        }

        DccPanel {
            Layout.fillWidth: true
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 8
                DccLabel { text: qsTr("GLOBAL FOG"); font.bold: true; color: "#888" }
                
                RowLayout {
                    DccLabel { text: qsTr("Density:"); Layout.preferredWidth: 60 }
                    Slider { id: densitySlider; from: 0; to: 1; value: 0.5; Layout.fillWidth: true }
                }
                RowLayout {
                    DccLabel { text: qsTr("Color:"); Layout.preferredWidth: 60 }
                    Rectangle { width: 24; height: 24; color: "#444"; border.color: "#666" }
                    DccButton { text: "PICK..."; flat: true }
                }
            }
        }

        DccPanel {
            Layout.fillWidth: true
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 8
                DccLabel { text: qsTr("FOG BRUSHES"); font.bold: true; color: "#888" }
                
                GridLayout {
                    columns: 2
                    Layout.fillWidth: true
                    DccButton { text: "ADD FOG"; Layout.fillWidth: true; onClicked: if(canvas) canvas.activeTool = "fog_add" }
                    DccButton { text: "ERASE FOG"; Layout.fillWidth: true; onClicked: if(canvas) canvas.activeTool = "fog_remove" }
                    DccButton { text: "TURBULENCE"; Layout.fillWidth: true }
                    DccButton { text: "STATIC"; Layout.fillWidth: true }
                }
            }
        }

        Item { Layout.fillHeight: true }

        DccButton {
            text: qsTr("CLEAR ALL FOG")
            Layout.fillWidth: true
            onClicked: console.log("Clearing all fog data")
        }
    }
}
