import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import DungeonEditor.components

ApplicationWindow {
    id: root
    width: 600
    height: 400
    color: "#0a0a0a"
    flags: Qt.Window | Qt.WindowTitleHint | Qt.WindowCloseButtonHint | Qt.WindowMinMaxButtonsHint
    
    property alias titleText: titleLabel.text
    default property alias content: container.data

    background: Rectangle {
        color: "#0a0a0a"
        border.color: "#383838"
        border.width: 1
    }

    header: Rectangle {
        height: 32
        color: "#1a1a1a"
        
        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 12
            anchors.rightMargin: 4
            
            DccLabel {
                id: titleLabel
                text: root.title
                color: "#f59e0b"
                font.pixelSize: 11
                font.bold: true
                Layout.fillWidth: true
            }
            
            DccButton {
                text: "✕"
                flat: true
                Layout.preferredWidth: 28
                Layout.preferredHeight: 28
                onClicked: root.close()
                contentItem: DccLabel {
                    text: "✕"
                    color: parent.hovered ? "#ef4444" : "#666"
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
            }
        }
        
        Rectangle {
            anchors.bottom: parent.bottom
            width: parent.width
            height: 1
            color: "#383838"
        }
    }

    Item {
        id: container
        anchors.fill: parent
        anchors.margins: 1
    }
}
