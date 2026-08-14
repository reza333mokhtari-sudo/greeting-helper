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
            text: "Inspector"
            color: "white"
            font.bold: true
        }
        
        GridLayout {
            columns: 2
            Layout.fillWidth: true
            
            Label { text: "X:"; color: "gray" }
            SpinBox { editable: true; Layout.fillWidth: true }
            
            Label { text: "Y:"; color: "gray" }
            SpinBox { editable: true; Layout.fillWidth: true }
            
            Label { text: "Rotation:"; color: "gray" }
            Dial { scale: 0.5; Layout.alignment: Qt.AlignHCenter }
            
            Label { text: "Scale:"; color: "gray" }
            Slider { value: 1.0; from: 0.1; to: 5.0; Layout.fillWidth: true }
        }
        
        Item { Layout.fillHeight: true }
    }
}
