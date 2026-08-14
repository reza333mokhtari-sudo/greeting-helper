import QtQuick
import QtQuick.Controls
import QtWebEngine
import "components"

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

ApplicationWindow {
    width: 1280
    height: 800
    visible: true
    title: qsTr("Dungeon Editor - Native Shell")

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        TopBar {
            Layout.fillWidth: true
            height: 50
        }

        RowLayout {
            Layout.fillWidth: true
            Layout.fillHeight: true
            spacing: 0

            ToolRail {
                width: 60
                Layout.fillHeight: true
            }

            AssetLibrary {
                width: 250
                Layout.fillHeight: true
            }

            WebEngineView {
                Layout.fillWidth: true
                Layout.fillHeight: true
                url: "http://localhost:8080"
                
                settings.accelerated2dCanvasEnabled: true
                settings.webGLEnabled: true
                settings.localContentCanAccessRemoteUrls: true
            }

            ColumnLayout {
                width: 300
                Layout.fillHeight: true
                spacing: 0

                AiPanel {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                }

                InspectorPanel {
                    Layout.fillWidth: true
                    height: 300
                }
            }
        }

        StatusBar {
            Layout.fillWidth: true
            height: 25
        }
    }
}
