import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "qrc:/qt/qml/DungeonEditor/qml/components"


Rectangle {
    color: "#252526"
    property var document: null

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 15
        spacing: 15

        Label {
            text: qsTr("Procedural Generator")
            color: "white"
            font.bold: true
            font.pixelSize: 18
        }

        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            
            ColumnLayout {
                width: parent.width - 20
                spacing: 20

                GroupBox {
                    title: qsTr("Dungeon Layout")
                    Layout.fillWidth: true
                    palette.windowText: "#aaa"
                    
                    ColumnLayout {
                        spacing: 8
                        Label { text: qsTr("Algorithm:"); color: "#888"; font.pixelSize: 11 }
                        ComboBox {
                            Layout.fillWidth: true
                            model: ["Binary Space Partitioning", "Cellular Automata", "Random Walk", "Maze"]
                        }
                        
                        RowLayout {
                            Label { text: qsTr("Iterations:"); color: "#888"; font.pixelSize: 11 }
                            SpinBox { value: 5; from: 1; to: 20; Layout.fillWidth: true }
                        }
                    }
                }

                GroupBox {
                    title: qsTr("Room Parameters")
                    Layout.fillWidth: true
                    palette.windowText: "#aaa"
                    
                    ColumnLayout {
                        spacing: 8
                        RowLayout {
                            Label { text: qsTr("Min Size:"); color: "#888"; font.pixelSize: 11 }
                            SpinBox { value: 200; stepSize: 50; from: 50; to: 1000; Layout.fillWidth: true }
                        }
                        RowLayout {
                            Label { text: qsTr("Max Size:"); color: "#888"; font.pixelSize: 11 }
                            SpinBox { value: 500; stepSize: 50; from: 50; to: 2000; Layout.fillWidth: true }
                        }
                    }
                }

                GroupBox {
                    title: qsTr("Connectivity")
                    Layout.fillWidth: true
                    palette.windowText: "#aaa"
                    
                    ColumnLayout {
                        CheckBox { text: qsTr("Ensure Solvable"); checked: true; palette.windowText: "#ccc" }
                        CheckBox { text: qsTr("Add Loops"); checked: false; palette.windowText: "#ccc" }
                    }
                }
            }
        }

        Button {
            text: qsTr("Generate Dungeon")
            Layout.fillWidth: true
            highlighted: true
            onClicked: {
                console.log("Generating procedural dungeon...")
                // In a real impl, this would call a C++ service that adds objects to Document
            }
        }
    }
}

