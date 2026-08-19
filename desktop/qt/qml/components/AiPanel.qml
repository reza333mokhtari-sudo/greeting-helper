import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import "qrc:/qt/qml/DungeonEditor/qml/components"

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

DccPanel {
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 4
        spacing: 8
        
        DccLabel { text: "AI ASSISTANT"; font.bold: true; color: "#f59e0b" }

        ListView {
            id: chatView
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            spacing: 6
            model: ListModel { id: chatModel }
            
            delegate: DccPanel {
                width: chatView.width
                height: Math.max(40, textLabel.height + 32)
                color: isAi ? "#323232" : "#3b4a5a"
                border.color: isAi ? "#3d3d3d" : "#4a5a6a"
                
                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 10
                    spacing: 4

                    DccLabel {
                        text: isAi ? "AI" : "USER"
                        color: isAi ? "#f59e0b" : "#3b82f6"
                        font.pixelSize: 9
                        font.bold: true
                    }

                    DccLabel {
                        id: textLabel
                        text: content
                        color: "#dddddd"
                        wrapMode: Text.Wrap
                        Layout.fillWidth: true
                        font.pixelSize: 11
                    }
                }
            }
            
            onCountChanged: scrollTimer.start()
            Timer { id: scrollTimer; interval: 50; onTriggered: chatView.positionViewAtEnd() }
        }
        
        ProgressBar {
            Layout.fillWidth: true
            visible: typeof aiClient !== 'undefined' && aiClient.isLoading
            indeterminate: true
            background: Rectangle { color: "#1a1a1a"; height: 2; radius: 1 }
            contentItem: Item {
                Rectangle {
                    width: parent.visualPosition * parent.width
                    height: 2
                    color: "#f59e0b"
                }
            }
        }
        
        RowLayout {
            DccTextField {
                id: aiInput
                placeholderText: qsTr("Describe dungeon...")
                Layout.fillWidth: true
                onAccepted: sendBtn.clicked()
            }
            DccButton {
                id: sendBtn
                text: qsTr("SEND")
                Layout.preferredWidth: 60
                enabled: typeof aiClient !== 'undefined' && !aiClient.isLoading && aiInput.text !== ""
                onClicked: {
                    chatModel.append({content: aiInput.text, isAi: false})
                    if (typeof aiClient !== 'undefined') aiClient.sendMessage(aiInput.text)
                    aiInput.text = ""
                }
            }
        }
    }

    Connections {
        target: (typeof aiClient !== 'undefined') ? aiClient : null
        function onResponseReceived(response) {
            chatModel.append({content: response, isAi: true})
        }
        function onErrorOccurred(error) {
            chatModel.append({content: qsTr("AI Service Offline: ") + error, isAi: true})
        }
    }
}
