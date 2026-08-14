import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import DungeonEditor.Core 1.0

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

ApplicationWindow {
    id: window
    width: 1280
    height: 800
    visible: true
    title: qsTr("Dungeon Editor - Native Port")
    color: "#1e1e1e"

    // Infrastructure
    Document { id: mapDocument }
    AssetLibraryModel { id: assetModel }
    
    Component.onCompleted: {
        assetModel.loadManifest("assets/soulslike/manifest.json")
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 0
        
        TopBar {
            Layout.fillWidth: true
        }
        
        SplitView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            orientation: Qt.Horizontal
            
            ToolRail {
                SplitView.minimumWidth: 50
                SplitView.preferredWidth: 50
            }
            
            Item {
                SplitView.fillWidth: true
                
                MapCanvasItem {
                    id: canvas
                    anchors.fill: parent
                    document: mapDocument
                    onSelectionChanged: (id) => inspector.updateSelection(id)
                }
                
                // Overlay for coordinates
                Label {
                    anchors.bottom: parent.bottom
                    anchors.left: parent.left
                    anchors.margins: 10
                    text: qsTr("X: %1 Y: %2").arg(Math.round(canvas.pan.x)).arg(Math.round(canvas.pan.y))
                    color: "white"
                }
            }
            
            SplitView {
                SplitView.minimumWidth: 250
                SplitView.preferredWidth: 300
                orientation: Qt.Vertical
                
                TabBar {
                    id: rightTabs
                    Layout.fillWidth: true
                    TabButton { text: qsTr("Assets") }
                    TabButton { text: qsTr("Inspector") }
                    TabButton { text: qsTr("Layers") }
                }
                
                StackLayout {
                    currentIndex: rightTabs.currentIndex
                    AssetLibrary { id: assets }
                    InspectorPanel { id: inspector }
                    LayersPanel { id: layers }
                }
                
                AiPanel {
                    SplitView.minimumHeight: 200
                    SplitView.preferredHeight: 250
                }
            }
        }
        
        StatusBar {
            Layout.fillWidth: true
        }
    }
}
