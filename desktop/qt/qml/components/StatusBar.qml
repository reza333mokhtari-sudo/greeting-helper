import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    color: "#007acc"
    
    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 10
        anchors.rightMargin: 10
        
        Label {
            text: "Ready"
            color: "white"
            font.pixelSize: 11
        }
        
        Item { Layout.fillWidth: true }
        
        Label {
            text: "FPS: 60"
            color: "white"
            font.pixelSize: 11
        }
    }
}
