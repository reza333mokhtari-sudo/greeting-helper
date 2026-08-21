import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import DungeonEditor.components

DccPanel {
    id: root
    width: 320
    height: 120
    color: "#cc1a1a1a"
    border.color: "#f87171"
    border.width: 2
    radius: 4
    visible: false
    
    property string command: ""
    property string error: ""
    property string suggestion: ""

    function show(cmd, err, sug) {
        command = cmd
        error = err
        suggestion = sug
        visible = true
        hideTimer.restart()
    }

    Timer {
        id: hideTimer
        interval: 8000
        onTriggered: root.visible = false
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 12
        spacing: 8
        
        RowLayout {
            AppIcon { icon: "status/help"; size: 16; color: "#f87171" }
            DccLabel { text: "TASK FAILURE DETECTED"; font.bold: true; color: "#f87171"; font.pixelSize: 12 }
            Item { Layout.fillWidth: true }
            DccButton {
                text: "X"
                Layout.preferredWidth: 20
                Layout.preferredHeight: 20
                onClicked: root.visible = false
            }
        }
        
        DccLabel {
            text: "CMD: " + root.command
            font.pixelSize: 10
            color: "#eee"
            elide: Text.ElideRight
            Layout.fillWidth: true
        }
        
        DccLabel {
            text: "ERR: " + root.error
            font.pixelSize: 9
            color: "#fca5a5"
            wrapMode: Text.Wrap
            Layout.fillWidth: true
            maximumLineCount: 2
        }
        
        Rectangle { Layout.fillWidth: true; height: 1; color: "#333" }
        
        DccLabel {
            text: "FIX: " + root.suggestion
            font.pixelSize: 10
            font.italic: true
            color: "#f59e0b"
            wrapMode: Text.Wrap
            Layout.fillWidth: true
        }
    }
    
    Connections {
        target: workspaceService
        function onTaskFailed(cmd, err, sug) {
            root.show(cmd, err, sug)
        }
    }
}
