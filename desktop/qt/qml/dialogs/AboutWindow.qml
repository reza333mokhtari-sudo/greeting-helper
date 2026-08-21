import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import DungeonEditor.components

BaseFloatingWindow {
    title: "ABOUT"
    width: 450
    height: 380
    
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 30
        spacing: 20
        
        Image {
            source: "qrc:/qt/qml/DungeonEditor/assets/icon.png"
            Layout.preferredWidth: 80
            Layout.preferredHeight: 80
            Layout.alignment: Qt.AlignHCenter
        }
        
        ColumnLayout {
            Layout.alignment: Qt.AlignHCenter
            spacing: 4
            DccLabel {
                text: "DUNGEON SCRAWL PROFESSIONAL"
                font.pixelSize: 18
                font.bold: true
                color: "#f59e0b"
                Layout.alignment: Qt.AlignHCenter
            }
            DccLabel {
                text: "CORE ENGINE V1.0.4 (BUILD 20260817)"
                font.pixelSize: 10
                color: "#666"
                Layout.alignment: Qt.AlignHCenter
            }
        }
        
        DccLabel {
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
            color: "#383838"
        }
        
        ColumnLayout {
            spacing: 5
            DccLabel { text: "Powered by Qt 6.7 and Vulkan Engine"; color: "#444"; font.pixelSize: 9; Layout.alignment: Qt.AlignHCenter }
            DccLabel { text: "© 2026 Core Engine Team. All rights reserved."; color: "#444"; font.pixelSize: 9; Layout.alignment: Qt.AlignHCenter }
        }
        
        RowLayout {
            Layout.alignment: Qt.AlignHCenter
            spacing: 12
            DccButton { text: "WEBSITE"; flat: true }
            DccButton { text: "GITHUB"; flat: true }
            DccButton { text: "DISCORD"; flat: true }
        }
    }
}
