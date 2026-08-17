import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Qt.labs.settings
import "../components"


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
                        Label { text: qsTr("UI Scale: "); color: "#aaa" }
                        Slider { from: 0.5; to: 2.0; value: 1.0 }
                    }
                    ComboBox {
                        model: ["Maya Dark", "Slate Grey", "High Contrast"]
                        Layout.fillWidth: true
                    }
                }
            }

            // Graphics
            Pane {
                background: null
                ColumnLayout {
                    Label { text: qsTr("Graphics / Viewport"); color: "white"; font.bold: true; font.pixelSize: 16 }
                    Label { text: qsTr("Rendering Backend:"); color: "#aaa" }
                    ComboBox {
                        id: backendCombo
                        model: ["Auto", "OpenGL", "Vulkan", "Software"]
                        currentIndex: model.indexOf(settings.backend)
                        Layout.fillWidth: true
                        onActivated: settings.backend = currentText
                    }
                    Label { 
                        text: qsTr("Requires application restart to take effect."); 
                        color: "#ef4444"; 
                        font.pixelSize: 11 
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

