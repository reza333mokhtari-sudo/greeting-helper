import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    color: "#252526"
    property var document
    property string selectedId: ""
    property var selectedObject: null

    function updateSelection(id) {
        selectedId = id;
        if (id === "" || !document || !document.objects) {
            selectedObject = null;
        } else {
            let objs = document.objects;
            selectedObject = null;
            for (let i = 0; i < objs.length; i++) {
                if (objs[i] && objs[i].id === id) {
                    selectedObject = objs[i];
                    break;
                }
            }
        }
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 12
        visible: selectedObject !== null

        Label {
            text: qsTr("Inspector")
            color: "white"
            font.bold: true
        }

        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true

            ColumnLayout {
                width: parent.width - 20
                spacing: 10

                Label { text: qsTr("ID: " + selectedId); color: "#666666"; font.pixelSize: 10 }

                TextField {
                    placeholderText: qsTr("Object Name")
                    text: selectedObject ? selectedObject.name : ""
                    Layout.fillWidth: true
                    background: Rectangle { color: "#3c3c3c"; radius: 4 }
                    color: "white"
                    onAccepted: document.updateObject(selectedId, { name: text })
                }

                Label { text: qsTr("Transform"); color: "white"; font.bold: true }

                GridLayout {
                    columns: 2
                    Layout.fillWidth: true
                    Label { text: "X"; color: "#aaa" }
                    SpinBox {
                        value: selectedObject ? selectedObject.x : 0
                        from: -5000; to: 5000; editable: true
                        onValueModified: document.updateObject(selectedId, { x: value })
                    }
                    Label { text: "Y"; color: "#aaa" }
                    SpinBox {
                        value: selectedObject ? selectedObject.y : 0
                        from: -5000; to: 5000; editable: true
                        onValueModified: document.updateObject(selectedId, { y: value })
                    }
                    Label { text: "W"; color: "#aaa"; visible: selectedObject && selectedObject.kind === "rect" }
                    SpinBox {
                        visible: selectedObject && selectedObject.kind === "rect"
                        value: selectedObject ? selectedObject.w : 0
                        from: 0; to: 5000; editable: true
                        onValueModified: document.updateObject(selectedId, { w: value })
                    }
                    Label { text: "H"; color: "#aaa"; visible: selectedObject && selectedObject.kind === "rect" }
                    SpinBox {
                        visible: selectedObject && selectedObject.kind === "rect"
                        value: selectedObject ? selectedObject.h : 0
                        from: 0; to: 5000; editable: true
                        onValueModified: document.updateObject(selectedId, { h: value })
                    }
                    Label { text: "Rotate"; color: "#aaa" }
                    Slider {
                        value: selectedObject ? selectedObject.rotation : 0
                        from: 0; to: 360
                        onMoved: document.updateObject(selectedId, { rotation: value })
                    }
                }

                Label { text: qsTr("Style"); color: "white"; font.bold: true }
                
                GridLayout {
                    columns: 2
                    Layout.fillWidth: true
                    
                    Label { text: "Global Radius"; color: "#aaa" }
                    Slider {
                        value: selectedObject ? (selectedObject.cornerRadius || 0) : 0
                        from: 0; to: 100
                        onMoved: document.updateObject(selectedId, { cornerRadius: value })
                    }
                    
                    Label { text: "TL Radius"; color: "#888" }
                    Slider {
                        value: selectedObject ? (selectedObject.radiusTL || selectedObject.cornerRadius || 0) : 0
                        from: 0; to: 100
                        onMoved: document.updateObject(selectedId, { radiusTL: value })
                    }
                    
                    Label { text: "TR Radius"; color: "#888" }
                    Slider {
                        value: selectedObject ? (selectedObject.radiusTR || selectedObject.cornerRadius || 0) : 0
                        from: 0; to: 100
                        onMoved: document.updateObject(selectedId, { radiusTR: value })
                    }
                    
                    Label { text: "BL Radius"; color: "#888" }
                    Slider {
                        value: selectedObject ? (selectedObject.radiusBL || selectedObject.cornerRadius || 0) : 0
                        from: 0; to: 100
                        onMoved: document.updateObject(selectedId, { radiusBL: value })
                    }
                    
                    Label { text: "BR Radius"; color: "#888" }
                    Slider {
                        value: selectedObject ? (selectedObject.radiusBR || selectedObject.cornerRadius || 0) : 0
                        from: 0; to: 100
                        onMoved: document.updateObject(selectedId, { radiusBR: value })
                    }
                }

                Button {
                    text: qsTr("Delete")
                    Layout.fillWidth: true
                    palette.button: "#5c1d1d"
                    onClicked: {
                        document.removeObject(selectedId)
                        updateSelection("")
                    }
                }
            }
        }
    }

    Label {
        anchors.centerIn: parent
        text: qsTr("No selection")
        color: "#444"
        visible: selectedObject === null
    }
}
