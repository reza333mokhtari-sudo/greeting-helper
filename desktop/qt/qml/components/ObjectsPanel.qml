import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    color: "#252526"
    ColumnLayout {
        anchors.fill: parent
        Label { text: "Objects List"; color: "white" }
        ListView {
            Layout.fillWidth: true; Layout.fillHeight: true
            model: mapDocument.objects
            delegate: ItemDelegate {
                text: modelData.name
                width: ListView.view.width
            }
        }
    }
}
