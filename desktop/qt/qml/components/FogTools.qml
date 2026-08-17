import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    color: "#252526"
    property var document: null
    property var canvas: null

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 15
        spacing: 15

        Label {
            text: qsTr("Fog & Environment")
            color: "white"
            font.bold: true
            font.pixelSize: 18
        }

        GroupBox {
            title: qsTr("Global Fog")
            Layout.fillWidth: true
            palette.windowText: "white"
            
            ColumnLayout {
                RowLayout {
                    Label { text: qsTr("Density:"); color: "#aaa" }
                    Slider { id: densitySlider; from: 0; to: 1; value: 0.5; Layout.fillWidth: true }
                }
                RowLayout {
                    Label { text: qsTr("Color:"); color: "#aaa" }
                    Rectangle { width: 24; height: 24; color: "#444"; border.color: "#666" }
                    Button { text: "Pick..."; flat: true }
                }
            }
        }

        GroupBox {
            title: qsTr("Fog Brushes")
            Layout.fillWidth: true
            palette.windowText: "white"
            
            GridLayout {
                columns: 2
                Button { text: "Add Fog"; Layout.fillWidth: true; onClicked: canvas.activeTool = "fog_add" }
                Button { text: "Erase Fog"; Layout.fillWidth: true; onClicked: canvas.activeTool = "fog_remove" }
                Button { text: "Turbulence"; Layout.fillWidth: true }
                Button { text: "Static"; Layout.fillWidth: true }
            }
        }

        Item { Layout.fillHeight: true }

        Button {
            text: qsTr("Clear All Fog")
            Layout.fillWidth: true
            onClicked: console.log("Clearing all fog data")
        }
    }
}
