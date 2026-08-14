import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Rectangle {
    id: root
    color: "#252526"
    
    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        TabBar {
            id: tabBar
            Layout.fillWidth: true
            background: Rectangle { color: "#2d2d2d" }
            
            TabButton { text: qsTr("Assets") }
            TabButton { text: qsTr("Layers") }
            TabButton { text: qsTr("Inspector") }
            TabButton { text: qsTr("AI") }
        }

        StackLayout {
            currentIndex: tabBar.currentIndex
            Layout.fillWidth: true
            Layout.fillHeight: true

            AssetLibrary {
                Layout.fillWidth: true
                Layout.fillHeight: true
            }

            LayersPanel {
                Layout.fillWidth: true
                Layout.fillHeight: true
            }

            InspectorPanel {
                Layout.fillWidth: true
                Layout.fillHeight: true
                targetObject: window.selectedObject
            }

            AiPanel {
                Layout.fillWidth: true
                Layout.fillHeight: true
            }
        }
    }
}
