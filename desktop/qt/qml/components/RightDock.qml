import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    color: "#252526"
    
    property var document: null
    property var canvas: null
    property var assetModel: null

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
            TabButton { text: qsTr("Assets") }
            TabButton { text: qsTr("Insp") }
            TabButton { text: qsTr("Objs") }
            TabButton { text: qsTr("Layers") }
            TabButton { text: qsTr("Settings") }
            TabButton { text: qsTr("CMS") }
        }

        StackLayout {
            currentIndex: dockTabs.currentIndex
            Layout.fillWidth: true
            Layout.fillHeight: true

            AssetLibrary {
                id: assetLibrary
                model: assetModel
                onAssetClicked: (asset) => {
                    document.addObject({
                        kind: "image",
                        name: asset.name,
                        assetId: asset.assetId,
                        x: -canvas.pan.x / canvas.zoom + (canvas.width / 2 / canvas.zoom),
                        y: -canvas.pan.y / canvas.zoom + (canvas.height / 2 / canvas.zoom),
                        rotation: 0,
                        cornerRadius: 0
                    })
                }
            }

            InspectorPanel {
                id: inspectorPanel
                document: document
            }
            
            ObjectsPanel {
                id: objectsPanel
                document: document
                onObjectSelected: (id) => canvas.selectedId = id
            }
            
            LayersPanel {
                id: layersPanel
                document: document
            }
            
            SettingsPanel {
                id: settingsPanel
                document: document
            }

            CmsPanel {
                id: cmsPanel
                document: document
            }
        }

        AiPanel {
            Layout.fillWidth: true
            Layout.preferredHeight: 250
            SplitView.minimumHeight: 150
        }
    }
}
