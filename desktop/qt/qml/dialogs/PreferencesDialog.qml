import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Qt.labs.settings
import "qrc:/qml/components"



Dialog {
    id: root
    title: qsTr("Preferences")
    width: 800
    height: 600
    modal: true
    standardButtons: Dialog.Ok | Dialog.Cancel | Dialog.Apply

    // Persistence logic
    Settings {
        id: settings
        category: "Graphics"
        property string backend: "Auto"
        property string rhiBackend: "Auto"
    }

    background: Rectangle {
        color: "#1e1e1e"
        border.color: "#3e3e42"
        radius: 4
    }

    header: Rectangle {
        color: "#252526"
        height: 40
        Label {
            anchors.centerIn: parent
            text: root.title
            color: "white"
            font.bold: true
        }
    }

    RowLayout {
        anchors.fill: parent
        spacing: 0

        Rectangle {
            Layout.preferredWidth: 180
            Layout.fillHeight: true
            color: "#161616"

            ListView {
                id: prefList
                anchors.fill: parent
                model: [
                    { name: qsTr("General"), icon: "general/settings" },
                    { name: qsTr("Interface"), icon: "panels/attributes" },
                    { name: qsTr("Graphics"), icon: "menu/vulkan" },
                    { name: qsTr("Performance"), icon: "status/performance" },
                    { name: qsTr("Shortcuts"), icon: "menu/save" }
                ]
                delegate: ItemDelegate {
                    width: parent.width
                    height: 40
                    highlighted: ListView.isCurrentItem
                    contentItem: RowLayout {
                        spacing: 10
                        AppIcon {
                            icon: modelData.icon
                            size: 16
                            active: highlighted
                        }
                        Label {
                            text: modelData.name
                            color: highlighted ? "white" : "#aaa"
                        }
                    }
                    onClicked: prefList.currentIndex = index
                }
            }
        }

        StackLayout {
            currentIndex: prefList.currentIndex
            Layout.fillWidth: true
            Layout.fillHeight: true
            
            // General
            Pane {
                background: null
                ColumnLayout {
                    Label { text: qsTr("General Settings"); color: "white"; font.bold: true; font.pixelSize: 16 }
                    CheckBox { text: qsTr("Auto-save every 5 minutes"); checked: true }
                    CheckBox { text: qsTr("Show splash screen at startup"); checked: true }
                }
            }

            // Interface
            Pane {
                background: null
                ColumnLayout {
                    Label { text: qsTr("Interface Settings"); color: "white"; font.bold: true; font.pixelSize: 16 }
                    
                    RowLayout {
                        Label { text: qsTr("Visual Style: "); color: "#aaa" }
                        ComboBox {
                            id: styleCombo
                            model: ["DungeonScrawl", "Fusion (Pro/Admin)"]
                            Layout.fillWidth: true
                            currentIndex: (styleManager && styleManager.currentStyle === "Fusion") ? 1 : 0
                            
                            // Visual constraint: Option 2 requires Admin
                            delegate: ItemDelegate {
                                width: parent.width
                                text: modelData
                                enabled: index === 0 || (styleManager && styleManager.isAdmin)
                                highlighted: ListView.isCurrentItem
                                contentItem: Text {
                                    text: modelData
                                    color: enabled ? "white" : "#666"
                                    verticalAlignment: Text.AlignVCenter
                                }
                            }
                            
                            onActivated: {
                                if (index === 1 && styleManager && !styleManager.isAdmin) {
                                    // Should not be reachable due to delegate, but safety check
                                    currentIndex = 0;
                                    return;
                                }
                                let newStyle = index === 1 ? "Fusion" : "Basic";
                                if (styleManager) styleManager.currentStyle = newStyle;
                            }
                        }
                    }

                    GroupBox {
                        title: qsTr("Debug / Dev Tools")
                        visible: styleManager && styleManager.isAdmin
                        Layout.fillWidth: true
                        palette.windowText: "#f39c12"
                        
                        ColumnLayout {
                            CheckBox {
                                id: forceFusionToggle
                                text: qsTr("Force Fusion Engine")
                                checked: styleManager && styleManager.currentStyle === "Fusion"
                                onToggled: {
                                    if (styleManager) {
                                        styleManager.currentStyle = checked ? "Fusion" : "Basic"
                                        styleManager.reloadStyling()
                                    }
                                }
                            }
                            Button {
                                text: qsTr("Hot Reload Styling")
                                Layout.fillWidth: true
                                onClicked: if (styleManager) styleManager.reloadStyling()
                            }
                            Button {
                                text: qsTr("Restart Application")
                                Layout.fillWidth: true
                                onClicked: if (styleManager) styleManager.restartApplication()
                            }
                        }
                    }


                    RowLayout {
                        Label { text: qsTr("UI Scale: "); color: "#aaa" }
                        Slider { from: 0.5; to: 2.0; value: 1.0 }
                    }

                }
            }

            // Graphics
            Pane {
                background: null
                ColumnLayout {
                    Label { text: qsTr("Graphics / Viewport"); color: "white"; font.bold: true; font.pixelSize: 16 }
                    Label { text: qsTr("Current Active API: ") + (styleManager ? styleManager.activeGraphicsApi() : "Unknown"); color: "#f39c12"; font.pixelSize: 11 }
                    Label { text: qsTr("Rendering Backend:"); color: "#aaa" }
                    ComboBox {
                        id: backendCombo
                        model: ["Auto", "OpenGL", "Vulkan", "Metal", "Direct3D 11", "Software"]
                        currentIndex: Math.max(0, model.indexOf(settings.rhiBackend))
                        Layout.fillWidth: true
                        onActivated: settings.rhiBackend = currentText
                    }
                    Label { 
                        text: qsTr("Requires application restart to take effect."); 
                        color: "#ef4444"; 
                        font.pixelSize: 11 
                    }
                    Button {
                        text: qsTr("Restart Now to Apply Graphics Changes")
                        visible: settings.rhiBackend !== "Auto" // Simplification for UI
                        onClicked: if (styleManager) styleManager.restartApplication()
                        palette.buttonText: "#ef4444"
                        Layout.fillWidth: true
                    }
                    CheckBox { text: qsTr("Enable Anti-aliasing (MSAA)"); checked: true }
                    CheckBox { text: qsTr("Vertical Sync (VSync)"); checked: true }
                }
            }

            // Performance
            Pane {
                background: null
                ColumnLayout {
                    Label { text: qsTr("Performance"); color: "white"; font.bold: true; font.pixelSize: 16 }
                    CheckBox { text: qsTr("Hardware Acceleration"); checked: true }
                    CheckBox { text: qsTr("Low Latency Input"); checked: true }
                }
            }

            // Shortcuts
            Pane {
                background: null
                ColumnLayout {
                    Label { text: qsTr("Keyboard Shortcuts"); color: "white"; font.bold: true; font.pixelSize: 16 }
                    Label { text: qsTr("Q - Select Tool"); color: "#aaa" }
                    Label { text: qsTr("W - Move Tool"); color: "#aaa" }
                    Label { text: qsTr("E - Rotate Tool"); color: "#aaa" }
                    Label { text: qsTr("R - Scale Tool"); color: "#aaa" }
                }
            }
        }
    }
}

