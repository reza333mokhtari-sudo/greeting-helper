import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    color: "#252526"
    border.color: "#3e3e42"
    
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 10
        
        Label {
            text: qsTr("AI Assistant")
            color: "white"
            font.bold: true
        }
        
        ListView {
            id: chatView
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            spacing: 8
            model: ListModel { id: chatModel }
            
            delegate: Rectangle {
                width: chatView.width
                height: textLabel.height + 20
                color: isAi ? "#2d2d2d" : "#007acc"
                radius: 6
                
                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 10
                    Label {
                        id: textLabel
                        text: content
                        color: "white"
                        wrapMode: Text.Wrap
                        Layout.fillWidth: true
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
        }
        
        RowLayout {
            TextField {
                id: aiInput
                placeholderText: qsTr("Describe your dungeon...")
                Layout.fillWidth: true
                color: "white"

                onAccepted: sendBtn.clicked()
            }
            Button {
                id: sendBtn
                text: qsTr("Send")
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
