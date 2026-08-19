import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * ZBrush-style Panel container with beveled borders and header
 */
Rectangle {
    id: root
    color: "#2b2b2b"
    border.color: "#383838"
    border.width: 1
    radius: 1

    property alias title: titleLabel.text
    property alias headerVisible: header.visible
    default property alias content: contentArea.data

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        Rectangle {
            id: header
            Layout.fillWidth: true
            height: 24
            color: "#333333"
            
            Rectangle {
                anchors.top: parent.top
                width: parent.width
                height: 1
                color: "#444444"
            }

            ZBrushLabel {
                id: titleLabel
                anchors.left: parent.left
                anchors.leftMargin: 8
                anchors.verticalCenter: parent.verticalCenter
                font.bold: true
                color: "#dddddd"
                font.pixelSize: 10
            }

            Rectangle {
                anchors.bottom: parent.bottom
                width: parent.width
                height: 1
                color: "#222222"
            }
        }

        Item {
            id: contentArea
            Layout.fillWidth: true
            Layout.fillHeight: true
            Layout.margins: 4
        }
    }

    // Outer bevel highlights
    Rectangle {
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        height: 1
        color: "#4a4a4a"
    }
}
