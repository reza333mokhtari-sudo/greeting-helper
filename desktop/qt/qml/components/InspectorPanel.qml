import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    color: "#252526"
    border.color: "#3e3e42"
    
    property string selectedId: ""
    property var selectedObject: null

    function updateSelection(id) {
        selectedId = id;
        if (id === "") {
            selectedObject = null;
        } else {
            let objs = mapDocument.objects;
            for (let i = 0; i < objs.length; i++) {
                if (objs[i].id === id) {
                    selectedObject = objs[i];
                    break;
                }
            }
        }
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 15
        visible: selectedObject !== null

        Label {
            text: qsTr("Object Properties")
            color: "white"
            font.bold: true
        }

        GridLayout {
            columns: 2
            rowSpacing: 10
            columnSpacing: 10
            Layout.fillWidth: true

            Label { text: qsTr("Name:"); color: "#cccccc" }
            TextField {
                text: selectedObject ? selectedObject.name : ""
                Layout.fillWidth: true
                color: "white"
                background: Rectangle { color: "#3c3c3c"; radius: 4 }
                onAccepted: mapDocument.updateObject(selectedId, { name: text })
            }

            Label { text: qsTr("X:"); color: "#cccccc" }
            SpinBox {
                value: selectedObject ? selectedObject.x : 0
                editable: true
                from: -10000; to: 10000
                Layout.fillWidth: true
                onValueModified: mapDocument.updateObject(selectedId, { x: value })
            }

            Label { text: qsTr("Y:"); color: "#cccccc" }
            SpinBox {
                value: selectedObject ? selectedObject.y : 0
                editable: true
                from: -10000; to: 10000
                Layout.fillWidth: true
                onValueModified: mapDocument.updateObject(selectedId, { y: value })
            }

            Label { text: qsTr("Rotation:"); color: "#cccccc" }
            Slider {
                value: selectedObject ? selectedObject.rotation : 0
                from: 0; to: 360
                Layout.fillWidth: true
                onMoved: mapDocument.updateObject(selectedId, { rotation: value })
            }

            Label { text: qsTr("Radius:"); color: "#cccccc" }
            Slider {
                value: selectedObject ? (selectedObject.cornerRadius || 0) : 0
                from: 0; to: 50
                Layout.fillWidth: true
                onMoved: mapDocument.updateObject(selectedId, { cornerRadius: value })
            }
        }

        Item { Layout.fillHeight: true }

        Button {
            text: qsTr("Delete Object")
            highlighted: true
            palette.button: "#e51400"
            Layout.fillWidth: true
            onClicked: {
                mapDocument.removeObject(selectedId);
                selectedId = "";
                selectedObject = null;
            }
        }
    }

    Label {
        anchors.centerIn: parent
        text: qsTr("Select an object to inspect")
        color: "#666666"
        visible: selectedObject === null
    }
}
