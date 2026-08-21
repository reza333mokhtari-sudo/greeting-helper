import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import DungeonEditor.components

DccPanel {
    id: root
    width: 50
    
    property var canvas: null
    property var workspace: null
    property string activeTool: workspace ? workspace.activeTool : (canvas ? canvas.activeTool : "select")


    ColumnLayout {
        anchors.fill: parent
        anchors.topMargin: 4
        spacing: 4

        DccLabel { text: "TOOLS"; font.bold: true; color: "#f59e0b"; Layout.alignment: Qt.AlignHCenter; font.pixelSize: 8 }

        Repeater {
            model: [
                { id: "select", icon: "tools/select" },
                { id: "move", icon: "tools/move" },
                { id: "rotate", icon: "tools/rotate" },
                { id: "scale", icon: "tools/scale" },
                { id: "room", icon: "tools/draw_room" },
                { id: "corridor", icon: "tools/draw_room" },
                { id: "prop", icon: "tools/place_prop" },
                { id: "texture", icon: "tools/texture_brush" },
                { id: "fog", icon: "tools/fog_brush" }
            ]

            DccButton {
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
                    if (workspace) workspace.activeTool = modelData.id
                    else if (canvas) canvas.activeTool = modelData.id
                }

            }
        }

        Item { Layout.fillHeight: true }
    }
}
