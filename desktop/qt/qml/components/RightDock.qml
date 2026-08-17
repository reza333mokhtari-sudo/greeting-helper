import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    color: "#252526"
    
    property var document: null
    property var canvas: null
    property var assetModel: null
    property alias aiPanelHeight: aiPanel.Layout.preferredHeight


    function updateInspector(id) {
        inspectorPanel.updateSelection(id)
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        TabBar {
            id: dockTabs
            Layout.fillWidth: true
            background: Rectangle { color: "#2d2d2d" }
            TabButton { text: qsTr("Browser") }
            TabButton { text: qsTr("Attrib") }
            TabButton { text: qsTr("Tool") }
            TabButton { text: qsTr("Layers") }
            TabButton { text: qsTr("Gen") }
            TabButton { text: qsTr("Fog") }
        }

        StackLayout {
            currentIndex: dockTabs.currentIndex
            Layout.fillWidth: true
            Layout.fillHeight: true

            AssetBrowser {
                id: assetLibrary
                assetModel: assetModel
                document: document
                canvas: canvas
            }

            InspectorPanel {
                id: inspectorPanel
                document: document
            }
            
            SettingsPanel {
                id: toolSettings
                document: document
            }
            
            LayersPanel {
                id: layersPanel
                document: document
            }
            
            CmsPanel {
                id: proceduralGen
                document: document
            }

            Rectangle {
                id: fogTools
                color: "#252526"
                Label { text: "Fog Tools Panel"; anchors.centerIn: parent; color: "#666" }
            }
        }

        AiPanel {
            id: aiPanel
            Layout.fillWidth: true
            Layout.preferredHeight: 250
            SplitView.minimumHeight: 150
        }

    }
}
