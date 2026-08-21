import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Qt.labs.settings
import DungeonEditor.components

Dialog {
    id: root
    title: qsTr("PREFERENCES")
    width: 800
    height: 600
    modal: true
    standardButtons: Dialog.Ok | Dialog.Cancel | Dialog.Apply

    Settings {
        id: settings
        category: "Graphics"
        property string backend: "Auto"
        property string rhiBackend: "Auto"
    }

    background: DccPanel {
        anchors.fill: parent
    }

    header: DccPanel {
        height: 40
        DccLabel {
            anchors.centerIn: parent
            text: root.title
            font.bold: true
            color: "#f59e0b"
        }
    }

    RowLayout {
        anchors.fill: parent
        spacing: 0

        DccPanel {
            Layout.preferredWidth: 180
            Layout.fillHeight: true
            color: "#161616"

            ListView {
                id: prefList
                anchors.fill: parent
                model: [
                    { name: qsTr("GENERAL"), icon: "general/settings" },
                    { name: qsTr("INTERFACE"), icon: "panels/attributes" },
                    { name: qsTr("GRAPHICS"), icon: "menu/vulkan" },
                    { name: qsTr("PERFORMANCE"), icon: "status/performance" },
                    { name: qsTr("SHORTCUTS"), icon: "menu/save" }
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
                        DccLabel {
                            text: modelData.name
                            color: highlighted ? "#f59e0b" : "#aaa"
                            font.bold: highlighted
                        }
                    }
                    onClicked: prefList.currentIndex = index
                    background: Rectangle { color: highlighted ? "#2b2b2b" : "transparent" }
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
                    DccLabel { text: qsTr("GENERAL SETTINGS"); font.bold: true; color: "#f59e0b" }
                    CheckBox { text: qsTr("Auto-save every 5 minutes"); checked: true }
                    CheckBox { text: qsTr("Show splash screen at startup"); checked: true }
                }
            }

            // Interface
            Pane {
                background: null
                ColumnLayout {
                    DccLabel { text: qsTr("INTERFACE SETTINGS"); font.bold: true; color: "#f59e0b" }
                    
                    RowLayout {
                        DccLabel { text: qsTr("Visual Style: ") }
                        ComboBox {
                            id: styleCombo
                            model: ["DungeonScrawl", "Fusion (Pro/Admin)"]
                            Layout.fillWidth: true
                            currentIndex: (typeof styleManager !== "undefined" && styleManager.currentStyle === "Fusion") ? 1 : 0
                            
                            delegate: ItemDelegate {
                                width: parent.width
                                text: modelData
                                enabled: index === 0 || (typeof styleManager !== "undefined" && styleManager.isAdmin)
                                highlighted: ListView.isCurrentItem
                                contentItem: DccLabel {
                                    text: modelData
                                    color: enabled ? "#eee" : "#666"
                                    verticalAlignment: Text.AlignVCenter
                                }
                            }
                            
                            onActivated: {
                                if (index === 1 && typeof styleManager !== "undefined" && !styleManager.isAdmin) {
                                    currentIndex = 0;
                                    return;
                                }
                                let newStyle = index === 1 ? "Fusion" : "Basic";
                                if (typeof styleManager !== "undefined") styleManager.currentStyle = newStyle;
                            }
                        }
                    }

                    DccPanel {
                        title: qsTr("DEBUG / DEV TOOLS")
                        visible: typeof styleManager !== "undefined" && styleManager.isAdmin
                        Layout.fillWidth: true
                        
                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 8
                            CheckBox {
                                id: forceFusionToggle
                                text: qsTr("Force Fusion Engine")
                                checked: typeof styleManager !== "undefined" && styleManager.currentStyle === "Fusion"
                                onToggled: {
                                    if (typeof styleManager !== "undefined") {
                                        styleManager.currentStyle = checked ? "Fusion" : "Basic"
                                        styleManager.reloadStyling()
                                    }
                                }
                            }
                            DccButton {
                                text: qsTr("HOT RELOAD STYLING")
                                Layout.fillWidth: true
                                onClicked: if (typeof styleManager !== "undefined") styleManager.reloadStyling()
                            }
                            DccButton {
                                text: qsTr("RESTART APPLICATION")
                                Layout.fillWidth: true
                                onClicked: if (typeof styleManager !== "undefined") styleManager.restartApplication()
                            }
                        }
                    }

                    RowLayout {
                        DccLabel { text: qsTr("UI Scale: ") }
                        Slider { from: 0.5; to: 2.0; value: 1.0 }
                    }
                }
            }

            // Graphics
            Pane {
                background: null
                ColumnLayout {
                    DccLabel { text: qsTr("GRAPHICS / VIEWPORT"); font.bold: true; color: "#f59e0b" }
                    DccLabel { text: qsTr("Current Active API: ") + (typeof styleManager !== "undefined" ? styleManager.activeGraphicsApi() : "Unknown"); color: "#f59e0b"; font.pixelSize: 11 }
                    DccLabel { text: qsTr("Rendering Backend:"); color: "#888" }
                    ComboBox {
                        id: backendCombo
                        model: ["Auto", "OpenGL", "Vulkan", "Metal", "Direct3D 11", "Software"]
                        currentIndex: Math.max(0, model.indexOf(settings.rhiBackend))
                        Layout.fillWidth: true
                        onActivated: settings.rhiBackend = currentText
                    }
                    DccLabel { 
                        text: qsTr("Requires application restart to take effect."); 
                        color: "#ef4444"; 
                        font.pixelSize: 11 
                    }
                    DccButton {
                        text: qsTr("RESTART NOW TO APPLY GRAPHICS CHANGES")
                        visible: settings.rhiBackend !== "Auto"
                        onClicked: if (typeof styleManager !== "undefined") styleManager.restartApplication()
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
                    DccLabel { text: qsTr("PERFORMANCE"); font.bold: true; color: "#f59e0b" }
                    CheckBox { text: qsTr("Hardware Acceleration"); checked: true }
                    CheckBox { text: qsTr("Low Latency Input"); checked: true }
                }
            }

            // Shortcuts
            Pane {
                background: null
                ColumnLayout {
                    DccLabel { text: qsTr("KEYBOARD SHORTCUTS"); font.bold: true; color: "#f59e0b" }
                    DccLabel { text: qsTr("Q - Select Tool"); color: "#aaa" }
                    DccLabel { text: qsTr("W - Move Tool"); color: "#aaa" }
                    DccLabel { text: qsTr("E - Rotate Tool"); color: "#aaa" }
                    DccLabel { text: qsTr("R - Scale Tool"); color: "#aaa" }
                }
            }
        }
    }
}
