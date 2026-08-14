import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    color: "#252526"
    border.color: "#3e3e42"
    property var document: null

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 10
        
        Label {
            text: qsTr("Floors")
            color: "white"
            font.bold: true
        }

        ListView {
            id: floorList
            Layout.fillWidth: true
            Layout.preferredHeight: 120
            clip: true
            model: document ? document.floors : null
            delegate: ItemDelegate {
                width: floorList.width
                text: modelData.name
                highlighted: modelData.active
                onClicked: {
                    // Logic to switch floor in document if needed
                }
            }
        }
        
        Button {
            text: qsTr("Add Floor")
            Layout.fillWidth: true
            onClicked: document.addFloor("New Floor")
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
            model: document ? document.layers : null
            delegate: RowLayout {
                width: layerList.width
                CheckBox {
                    checked: modelData.isVisible
                    onToggled: document.toggleLayer(modelData.name, checked)
                }
                Label {
                    text: modelData.name
                    color: "white"
                    Layout.fillWidth: true
                }
            }
        }
    }
}
