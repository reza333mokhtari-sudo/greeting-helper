import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    color: "#252526"
    border.color: "#3e3e42"
    
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 10
        
        Label {
            text: qsTr("Floors & Layers")
            color: "white"
            font.bold: true
        }

        ListView {
            id: floorList
            Layout.fillWidth: true
            Layout.preferredHeight: 120
            clip: true
            model: ListModel {
                id: floorModel
                ListElement { name: "Basement"; active: false; floorId: "f1" }
                ListElement { name: "Ground Floor"; active: true; floorId: "f2" }
                ListElement { name: "Second Floor"; active: false; floorId: "f3" }
            }
            delegate: ItemDelegate {
                width: floorList.width
                text: name
                highlighted: active
                onClicked: {
                    for(var i=0; i<floorModel.count; i++) 
                        floorModel.setProperty(i, "active", i === index)
                    console.log("Switching to floor:", floorId)
                }
            }
        }
        
        Button {
            text: qsTr("Add Floor")
            Layout.fillWidth: true
            onClicked: floorModel.append({name: "New Floor", active: false, floorId: "fn"})
        }

        ToolSeparator { Layout.fillWidth: true; orientation: Qt.Horizontal }

        Label {
            text: qsTr("Layers")
            color: "white"
            font.bold: true
        }

        ListView {
            id: layerList
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            model: ListModel {
                ListElement { name: "Props"; isVisible: true }
                ListElement { name: "Structure"; isVisible: true }
                ListElement { name: "Background"; isVisible: true }
            }
            delegate: RowLayout {
                width: layerList.width
                CheckBox {
                    checked: isVisible
                    onToggled: isVisible = checked
                }
                Label {
                    text: name
                    color: "white"
                    Layout.fillWidth: true
                }
            }
        }
    }
}
