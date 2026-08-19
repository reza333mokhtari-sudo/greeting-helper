import QtQuick
import QtQuick.Controls

/**
 * ZBrush-style Button with distinct borders and bevel look
 */
Button {
    id: control
    
    contentItem: Text {
        text: control.text
        font: control.font
        color: control.down ? "#ffffff" : "#cccccc"
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
        elide: Text.ElideRight
    }

    background: Rectangle {
        implicitWidth: 100
        implicitHeight: 28
        color: control.down ? "#3a3a3a" : (control.hovered ? "#353535" : "#2b2b2b")
        border.color: control.activeFocus ? "#f59e0b" : "#383838"
        border.width: 1
        radius: 1 // Characteristic ZBrush sharp corners

        // Top highlight for bevel effect
        Rectangle {
            anchors.top: parent.top
            anchors.left: parent.left
            anchors.right: parent.right
            height: 1
            color: "#4a4a4a"
            visible: !control.down
        }
    }
}
