import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import DungeonEditor.components

DccPanel {
    property var document: null

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 15
        spacing: 15

        DccLabel {
            text: qsTr("PROCEDURAL GENERATOR")
            font.bold: true
            color: "#f59e0b"
        }

        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            
            ColumnLayout {
                width: parent.width - 20
                spacing: 12

                DccPanel {
                    Layout.fillWidth: true
                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 8
                        DccLabel { text: qsTr("DUNGEON LAYOUT"); font.bold: true; color: "#888" }
                        
                        DccLabel { text: qsTr("Algorithm:"); font.pixelSize: 11 }
                        ComboBox {
                            Layout.fillWidth: true
                            model: ["Binary Space Partitioning", "Cellular Automata", "Random Walk", "Maze"]
                            Layout.preferredHeight: 24
                        }
                        
                        RowLayout {
                            DccLabel { text: qsTr("Iterations:"); font.pixelSize: 11 }
                            SpinBox { value: 5; from: 1; to: 20; Layout.fillWidth: true; Layout.preferredHeight: 24 }
                        }
                    }
                }

                DccPanel {
                    Layout.fillWidth: true
                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 8
                        DccLabel { text: qsTr("ROOM PARAMETERS"); font.bold: true; color: "#888" }
                        
                        RowLayout {
                            DccLabel { text: qsTr("Min Size:"); font.pixelSize: 11 }
                            SpinBox { value: 200; stepSize: 50; from: 50; to: 1000; Layout.fillWidth: true; Layout.preferredHeight: 24 }
                        }
                        RowLayout {
                            DccLabel { text: qsTr("Max Size:"); font.pixelSize: 11 }
                            SpinBox { value: 500; stepSize: 50; from: 50; to: 2000; Layout.fillWidth: true; Layout.preferredHeight: 24 }
                        }
                    }
                }

                DccPanel {
                    Layout.fillWidth: true
                    ColumnLayout {
                        anchors.fill: parent
                        anchors.margins: 8
                        DccLabel { text: qsTr("CONNECTIVITY"); font.bold: true; color: "#888" }
                        
                        CheckBox { text: qsTr("Ensure Solvable"); checked: true }
                        CheckBox { text: qsTr("Add Loops"); checked: false }
                    }
                }
            }
        }

        DccButton {
            text: qsTr("GENERATE DUNGEON")
            Layout.fillWidth: true
            onClicked: {
                console.log("Generating procedural dungeon...")
            }
        }
    }
}
