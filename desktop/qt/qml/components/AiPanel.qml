import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    color: "#252526"
    border.color: "#3e3e42"
    
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        
        Label {
            text: "AI Assistant"
            color: "white"
            font.bold: true
        }
        
        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            TextArea {
                id: chatLog
                readOnly: true
                textFormat: Text.PlainText
                wrapMode: Text.Wrap
                color: "#d4d4d4"
                background: Rectangle { color: "#1e1e1e" }
            }
        }
        
        RowLayout {
            TextField {
                id: inputField
                placeholderText: "Ask AI..."
                Layout.fillWidth: true
                color: "white"
                background: Rectangle { color: "#3c3c3c" }
                onAccepted: sendBtn.clicked()
            }
            Button {
                id: sendBtn
                text: aiClient.isLoading ? "..." : "Send"
                enabled: !aiClient.isLoading
                onClicked: {
                    if (inputField.text) {
                        chatLog.text += "You: " + inputField.text + "\n"
                        aiClient.sendMessage(inputField.text)
                        inputField.text = ""
                    }
                }
            }
        }
    }
    
    Connections {
        target: aiClient
        function onResponseReceived(response) {
            chatLog.text += "AI: " + response + "\n"
        }
        function onErrorOccurred(error) {
            chatLog.text += "Error: " + error + "\n"
        }
    }
}
