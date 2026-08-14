import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

ScrollView {
    id: root
    clip: true
    property var targetObject: null

    ColumnLayout {
        width: parent.width - 20
        anchors.margins: 10
        spacing: 15

        Label {
            text: qsTr("Object Properties")
            color: "white"
            font.bold: true
            visible: root.targetObject !== null
        }

        Rectangle {
            Layout.fillWidth: true
            height: 100
            color: "#3e3e42"
            visible: root.targetObject === null
            radius: 4
            Text {
                anchors.centerIn: parent
                text: qsTr("No selection")
                color: "#888"
            }
        }

        ColumnLayout {
            Layout.fillWidth: true
            visible: root.targetObject !== null
            spacing: 8

            // ID & Name
            Label { text: qsTr("ID: ") + (root.targetObject ? root.targetObject.id : ""); color: "#aaa"; font.pixelSize: 11 }
            
            RowLayout {
                Label { text: qsTr("Name"); color: "white"; Layout.preferredWidth: 60 }
                TextField {
                    Layout.fillWidth: true
                    text: root.targetObject ? root.targetObject.name : ""
                    onAccepted: if(root.targetObject) mapDocument.updateObject(root.targetObject.id, {name: text})
                }
            }

            // Transform
            Label { text: qsTr("Transform"); color: "#007acc"; font.bold: true; Layout.topMargin: 10 }
            
            GridLayout {
                columns: 2
                Layout.fillWidth: true
                
                Label { text: "X"; color: "white" }
                SpinBox { 
                    editable: true; Layout.fillWidth: true; from: -10000; to: 10000; 
                    value: root.targetObject ? root.targetObject.x : 0
                    onValueModified: if(root.targetObject) mapDocument.updateObject(root.targetObject.id, {x: value})
                }

                Label { text: "Y"; color: "white" }
                SpinBox { 
                    editable: true; Layout.fillWidth: true; from: -10000; to: 10000; 
                    value: root.targetObject ? root.targetObject.y : 0
                    onValueModified: if(root.targetObject) mapDocument.updateObject(root.targetObject.id, {y: value})
                }

                Label { text: "Rotation"; color: "white" }
                Slider { 
                    Layout.fillWidth: true; from: 0; to: 360; 
                    value: root.targetObject ? root.targetObject.rotation : 0
                    onMoved: if(root.targetObject) mapDocument.updateObject(root.targetObject.id, {rotation: value})
                }
            }

            // Radii
            Label { text: qsTr("Appearance"); color: "#007acc"; font.bold: true; Layout.topMargin: 10 }
            
            RowLayout {
                Label { text: qsTr("Corner Radius"); color: "white"; Layout.fillWidth: true }
                SpinBox { 
                    editable: true; from: 0; to: 100;
                    value: root.targetObject ? root.targetObject.cornerRadius : 0
                    onValueModified: if(root.targetObject) mapDocument.updateObject(root.targetObject.id, {cornerRadius: value})
                }
            }

            Button {
                text: qsTr("Delete Object")
                Layout.fillWidth: true
                onClicked: if(root.targetObject) mapDocument.removeObject(root.targetObject.id)
                palette.button: "#5c0000"
                palette.buttonText: "white"
            }
        }
    }
}
