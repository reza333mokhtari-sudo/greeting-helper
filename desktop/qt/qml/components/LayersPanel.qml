import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import "qrc:/qt/qml/DungeonEditor/qml/components"

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

DccPanel {
    property var document: null

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 10
        
        DccLabel {
            text: qsTr("FLOORS")
            font.bold: true
            color: "#f59e0b"
        }

        ListView {
            id: floorList
            Layout.fillWidth: true
            Layout.preferredHeight: 120
            clip: true
            model: document ? document.floors : null
            delegate: ItemDelegate {
                width: floorList.width
                background: Rectangle {
                    color: highlighted ? "#3e3e3e" : "transparent"
                }
                contentItem: DccLabel {
                    text: modelData.name
                    color: highlighted ? "#f59e0b" : "#ccc"
                    verticalAlignment: Text.AlignVCenter
                }
                highlighted: modelData.active
            }
        }
        
        DccButton {
            text: qsTr("ADD FLOOR")
            Layout.fillWidth: true
            onClicked: {
                if (document && typeof document.addFloor === "function") {
                    document.addFloor("New Floor");
                }
            }
        }

        Rectangle { Layout.fillWidth: true; height: 1; color: "#333" }

        DccLabel {
            text: qsTr("LAYERS")
            font.bold: true
            color: "#f59e0b"
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
                    id: layerCb
                    checked: modelData.isVisible
                    onToggled: document.toggleLayer(modelData.name, checked)
                }
                DccLabel {
                    text: modelData.name
                    Layout.fillWidth: true
                }
            }
        }
    }
}
