import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import DungeonEditor.components

DccPanel {
    id: root
    color: "#1e1e1e"
    border.color: "#333"
    
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 4
        spacing: 4
        
        RowLayout {
            DccLabel { text: "DIAGNOSTIC CONSOLE"; font.bold: true; color: "#f59e0b" }
            Item { Layout.fillWidth: true }
            DccButton {
                text: "CLEAR"
                Layout.preferredHeight: 20
                Layout.preferredWidth: 60
                onClicked: {
                    // console clearing logic if needed
                }
            }
        }
        
        ListView {
            id: logList
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            model: workspaceService ? workspaceService.logs : []
            
            delegate: DccPanel {
                width: logList.width
                height: Math.max(20, logText.height + 4)
                color: modelData.includes("[WARNING]") ? "#3a3a10" : 
                       modelData.includes("[CRITICAL]") || modelData.includes("[FATAL]") ? "#3a1010" : "transparent"
                
                DccLabel {
                    id: logText
                    anchors.fill: parent
                    anchors.leftMargin: 4
                    text: modelData
                    font.pixelSize: 9
                    font.family: "Monospace"
                    color: modelData.includes("[WARNING]") ? "#fcd34d" : 
                           modelData.includes("[CRITICAL]") || modelData.includes("[FATAL]") ? "#f87171" : "#aaa"
                    wrapMode: Text.Wrap
                }
            }
        }
    }
}
