import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "qrc:/qt/qml/DungeonEditor/qml/components"

ZBrushPanel {
    title: qsTr("INSPECTOR")
    color: "#252526"
    
    property var document
    property string selectedId: ""
    property var selectedObject: null

    function updateSelection(id) {
        selectedId = id;
        if (id === "" || !document || typeof document.objects === "undefined") {
            selectedObject = null;
        } else {
            let objs = document.objects;
            selectedObject = null;
            if (objs) {
                for (let i = 0; i < objs.length; i++) {
                    if (objs[i] && objs[i].id === id) {
                        selectedObject = objs[i];
                        break;
                    }
                }
            }
        }
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 8
        visible: selectedObject !== null

        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true

            ColumnLayout {
                width: parent.width - 16
                spacing: 12

                ZBrushPanel {
                    Layout.fillWidth: true
                    Layout.preferredHeight: 60
                    title: "IDENTIFICATION"
                    ColumnLayout {
                        anchors.fill: parent
                        ZBrushLabel { text: qsTr("UUID: " + selectedId); color: "#555"; font.pixelSize: 9 }
                        ZBrushTextField {
                            text: selectedObject ? selectedObject.name : ""
                            Layout.fillWidth: true
                            onAccepted: document.updateObject(selectedId, { name: text })
                        }
                    }
                }

                ZBrushPanel {
                    Layout.fillWidth: true
                    title: "TRANSFORM"
                    GridLayout {
                        anchors.fill: parent
                        columns: 2
                        rowSpacing: 8
                        
                        ZBrushLabel { text: "POS X"; Layout.preferredWidth: 40 }
                        SpinBox {
                            value: selectedObject ? selectedObject.x : 0
                            from: -5000; to: 5000; editable: true
                            Layout.fillWidth: true
                            onValueModified: document.updateObject(selectedId, { x: value })
                        }
                        
                        ZBrushLabel { text: "POS Y" }
                        SpinBox {
                            value: selectedObject ? selectedObject.y : 0
                            from: -5000; to: 5000; editable: true
                            Layout.fillWidth: true
                            onValueModified: document.updateObject(selectedId, { y: value })
                        }

                        ZBrushLabel { text: "ROT" }
                        Slider {
                            value: selectedObject ? selectedObject.rotation : 0
                            from: 0; to: 360
                            Layout.fillWidth: true
                            onMoved: document.updateObject(selectedId, { rotation: value })
                        }
                    }
                }

                ZBrushPanel {
                    Layout.fillWidth: true
                    title: "GEOMETRY"
                    visible: selectedObject && selectedObject.kind === "rect"
                    GridLayout {
                        anchors.fill: parent
                        columns: 2
                        rowSpacing: 8
                        
                        ZBrushLabel { text: "WIDTH"; Layout.preferredWidth: 40 }
                        SpinBox {
                            value: selectedObject ? selectedObject.w : 0
                            from: 0; to: 5000; editable: true
                            Layout.fillWidth: true
                            onValueModified: document.updateObject(selectedId, { w: value })
                        }
                        
                        ZBrushLabel { text: "HEIGHT" }
                        SpinBox {
                            value: selectedObject ? selectedObject.h : 0
                            from: 0; to: 5000; editable: true
                            Layout.fillWidth: true
                            onValueModified: document.updateObject(selectedId, { h: value })
                        }
                    }
                }

                ZBrushButton {
                    text: qsTr("DELETE OBJECT")
                    Layout.fillWidth: true
                    palette.buttonText: "#ff4444"
                    onClicked: {
                        document.removeObject(selectedId)
                        updateSelection("")
                    }
                }
            }
        }
    }

    ZBrushLabel {
        anchors.centerIn: parent
        text: qsTr("SELECT AN OBJECT TO INSPECT")
        color: "#444"
        font.pixelSize: 10
        visible: selectedObject === null
    }
}
