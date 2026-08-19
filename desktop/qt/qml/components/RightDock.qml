import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "qrc:/qt/qml/DungeonEditor/qml/components"
import "qrc:/qt/qml/DungeonEditor/qml/panels"

DccPanel {
    color: "#252526"
    border.color: "#383838"
    border.width: 1
    
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
            TabButton { 
                contentItem: AppIcon { icon: "panels/asset_library"; size: 16; anchors.centerIn: parent; active: dockTabs.currentIndex === 0 }
                ToolTip.visible: hovered; ToolTip.text: qsTr("Browser")
            }
            TabButton { 
                contentItem: AppIcon { icon: "panels/attributes"; size: 16; anchors.centerIn: parent; active: dockTabs.currentIndex === 1 }
                ToolTip.visible: hovered; ToolTip.text: qsTr("Attributes")
            }
            TabButton { 
                contentItem: AppIcon { icon: "general/settings"; size: 16; anchors.centerIn: parent; active: dockTabs.currentIndex === 2 }
                ToolTip.visible: hovered; ToolTip.text: qsTr("Tool Settings")
            }
            TabButton { 
                contentItem: AppIcon { icon: "panels/layers"; size: 16; anchors.centerIn: parent; active: dockTabs.currentIndex === 3 }
                ToolTip.visible: hovered; ToolTip.text: qsTr("Layers")
            }
            TabButton { 
                contentItem: AppIcon { icon: "tools/procedural"; size: 16; anchors.centerIn: parent; active: dockTabs.currentIndex === 4 }
                ToolTip.visible: hovered; ToolTip.text: qsTr("Generator")
            }
            TabButton { 
                contentItem: AppIcon { icon: "tools/fog_brush"; size: 16; anchors.centerIn: parent; active: dockTabs.currentIndex === 5 }
                ToolTip.visible: hovered; ToolTip.text: qsTr("Fog")
            }
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

            FogTools {
                id: fogTools
                document: document
                canvas: canvas
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
