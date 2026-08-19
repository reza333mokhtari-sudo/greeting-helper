import QtQuick
import QtQuick.Controls

/**
 * Minimalist text input for properties.
 */
TextField {
    id: control
    color: "#eee"
    selectionColor: "#4a90e2"
    selectedTextColor: "#ffffff"
    font.pixelSize: 11
    
    background: Rectangle {
        implicitWidth: 80
        implicitHeight: 24
        color: "#151515"
        border.color: control.activeFocus ? "#4a90e2" : "#333"
        border.width: 1
        radius: 2
    }
}
