import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

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
        border.color: "#2d2d2d"
        border.width: 1
    }

    header: Rectangle {
        height: 32
        color: "#1e1e1e"
        
        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 12
            anchors.rightMargin: 4
            
            Label {
                id: titleLabel
                text: root.title
                color: "#eee"
                font.pixelSize: 12
                font.bold: true
                Layout.fillWidth: true
            }
            
            ToolButton {
                text: "✕"
                flat: true
                onClicked: root.close()
                contentItem: Label {
                    text: "✕"
                    color: parent.hovered ? "#ef4444" : "#888"
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }
            }
        }
    }

    Item {
        id: container
        anchors.fill: parent
        anchors.margins: 1
    }
}
