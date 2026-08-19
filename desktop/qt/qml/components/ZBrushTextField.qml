import QtQuick
import QtQuick.Controls

TextField {
    id: control
    color: "#eeeeee"
    font.pixelSize: 11
    selectionColor: "#f59e0b"
    selectedTextColor: "#ffffff"
    placeholderTextColor: "#666666"
    verticalAlignment: TextInput.AlignVCenter

    background: Rectangle {
        implicitWidth: 200
        implicitHeight: 24
        color: "#1a1a1a"
        border.color: control.activeFocus ? "#f59e0b" : "#383838"
        border.width: 1
        radius: 1

        // Inner shadow effect
        Rectangle {
            anchors.top: parent.top
            anchors.left: parent.left
            anchors.right: parent.right
            height: 1
            color: "#000000"
            opacity: 0.3
        }
    }
}
