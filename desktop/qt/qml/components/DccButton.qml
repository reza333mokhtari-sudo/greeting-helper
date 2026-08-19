import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * Standard sculpted button following the Z-style DCC aesthetic.
 * Dark charcoal, subtle borders, high-contrast text.
 */
Button {
    id: control
    
    property color backgroundColor: control.pressed ? "#444" : (control.hovered ? "#3a3a3a" : "#2a2a2a")
    property color borderColor: "#151515"
    property color textColor: control.enabled ? "#ddd" : "#555"
    
    contentItem: Text {
        text: control.text
        font: control.font
        color: control.textColor
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
        elide: Text.ElideRight
    }

    background: Rectangle {
        implicitWidth: 80
        implicitHeight: 26
        color: control.backgroundColor
        border.color: control.borderColor
        border.width: 1
        radius: 2
        
        // Interior bevel
        Rectangle {
            anchors.fill: parent
            anchors.margins: 1
            color: "transparent"
            border.color: "#333"
            border.width: 1
            opacity: 0.3
        }
    }
}
