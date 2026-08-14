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
        Label { text: "Settings"; color: "white" }
        CheckBox { text: "Snap to Grid"; checked: true; color: "white" }
        CheckBox { text: "Show Minimap"; checked: true; color: "white" }
    }
}
