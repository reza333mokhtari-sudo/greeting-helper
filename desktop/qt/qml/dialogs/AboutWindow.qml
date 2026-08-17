import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

BaseFloatingWindow {
    title: "About Dungeon Scrawl"
    width: 450
    height: 380
    
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 30
        spacing: 20
        
        Image {
            source: "../../assets/icon.png"
            Layout.preferredWidth: 80
            Layout.preferredHeight: 80
            Layout.alignment: Qt.AlignHCenter
        }
        
        ColumnLayout {
            Layout.alignment: Qt.AlignHCenter
            spacing: 4
            Label {
                text: "Dungeon Scrawl Professional"
                font.pixelSize: 18
                font.bold: true
                color: "#3b82f6"
                Layout.alignment: Qt.AlignHCenter
            }
            Label {
                text: "Version 1.0.4 (Build 20260817)"
                font.pixelSize: 11
                color: "#888"
                Layout.alignment: Qt.AlignHCenter
            }
        }
        
        Label {
            text: "A professional-grade dungeon mapping and procedural generation tool designed for game masters and level designers."
            wrapMode: Text.WordWrap
            horizontalAlignment: Text.AlignHCenter
            Layout.fillWidth: true
            color: "#ccc"
            font.pixelSize: 12
        }
        
        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: "#2d2d2d"
        }
        
        ColumnLayout {
            spacing: 5
            Label { text: "Powered by Qt 6.7 and Vulkan Engine"; color: "#666"; font.pixelSize: 10; Layout.alignment: Qt.AlignHCenter }
            Label { text: "© 2026 DungeonEditor Team. All rights reserved."; color: "#666"; font.pixelSize: 10; Layout.alignment: Qt.AlignHCenter }
        }
        
        RowLayout {
            Layout.alignment: Qt.AlignHCenter
            spacing: 20
            Button { text: "Website"; flat: true }
            Button { text: "GitHub"; flat: true }
            Button { text: "Discord"; flat: true }
        }
    }
}
