import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import "qrc:/qt/qml/DungeonEditor/qml/components"

Rectangle {
    id: root
    width: 48
    color: "#1e1e1e"
    
    property var canvas: null
    property string activeTool: canvas ? canvas.activeTool : "select"

    ColumnLayout {
        anchors.fill: parent
        anchors.topMargin: 8
        spacing: 2

        Repeater {
            model: [
                { id: "select", icon: "tools/select", tip: "Select (Q)" },
                { id: "move", icon: "tools/move", tip: "Move (W)" },
                { id: "room", icon: "tools/draw_room", tip: "Draw Room (R)" },
                { id: "corridor", icon: "tools/draw_corridor", tip: "Draw Corridor (D)" },
                { id: "prop", icon: "tools/place_prop", tip: "Place Prop (P)" },
                { id: "texture", icon: "tools/texture_brush", tip: "Texture Brush (T)" },
                { id: "fog", icon: "tools/fog_brush", tip: "Fog Brush (F)" },
                { id: "erase", icon: "tools/eraser", tip: "Eraser (E)" },
                { id: "measure", icon: "tools/measure", tip: "Measure (M)" }
            ]

            delegate: ToolButton {
                id: btn
                Layout.preferredWidth: 36
                Layout.preferredHeight: 36
                Layout.alignment: Qt.AlignHCenter
                checkable: true
                checked: root.activeTool === modelData.id
                
                contentItem: AppIcon {
                    icon: modelData.icon
                    size: 20
                    active: btn.checked
                }
                
                background: Rectangle {
                    color: btn.checked ? "#2d2d2d" : (btn.hovered ? "#252526" : "transparent")
                    radius: 4
                    border.color: btn.checked ? "#3b82f6" : "transparent"
                }

                onClicked: {
                    if (canvas) canvas.activeTool = modelData.id
                }
                
                ToolTip.visible: hovered
                ToolTip.text: modelData.tip
            }
        }

        Item { Layout.fillHeight: true }
        
        ToolButton {
            Layout.preferredWidth: 36
            Layout.preferredHeight: 36
            Layout.alignment: Qt.AlignHCenter
            contentItem: AppIcon { icon: "general/settings"; size: 18 }
            onClicked: preferencesDialog.open()
        }
    }
}
