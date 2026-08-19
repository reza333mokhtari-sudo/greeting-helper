import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import "qrc:/qt/qml/DungeonEditor/qml/components"

ZBrushPanel {
    id: root
    width: 50
    title: "TOOLS"
    
    property var canvas: null
    property string activeTool: canvas ? canvas.activeTool : "select"

    ColumnLayout {
        anchors.fill: parent
        anchors.topMargin: 4
        spacing: 4

        Repeater {
            model: [
                { id: "select", icon: "tools/select" },
                { id: "move", icon: "tools/move" },
                { id: "rotate", icon: "tools/rotate" },
                { id: "scale", icon: "tools/scale" },
                { id: "room", icon: "tools/draw_room" },
                { id: "corridor", icon: "tools/draw_room" }, // Reusing room icon for now or a generic one
                { id: "prop", icon: "tools/place_prop" },
                { id: "texture", icon: "tools/texture_brush" },
                { id: "fog", icon: "tools/fog_brush" }
            ]

            ZBrushButton {
                id: btn
                Layout.preferredWidth: 38
                Layout.preferredHeight: 38
                Layout.alignment: Qt.AlignHCenter
                checkable: true
                checked: root.activeTool === modelData.id
                
                contentItem: AppIcon {
                    icon: modelData.icon
                    size: 20
                    anchors.centerIn: parent
                    active: btn.checked
                }
                
                onClicked: {
                    if (canvas) canvas.activeTool = modelData.id
                }
            }
        }

        Item { Layout.fillHeight: true }
    }
}
