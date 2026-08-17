import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Dialog {
    id: root
    title: qsTr("Preferences")
    width: 800
    height: 600
    modal: true
    standardButtons: Dialog.Ok | Dialog.Cancel | Dialog.Apply

    background: Rectangle {
        color: "#252526"
        border.color: "#3e3e42"
        radius: 4
    }

    header: Rectangle {
        color: "#2d2d2d"
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

        // Categories Sidebar
        Rectangle {
            Layout.preferredWidth: 180
            Layout.fillHeight: true
            color: "#1e1e1e"

            ListView {
                id: prefList
                anchors.fill: parent
                model: [
                    qsTr("General"),
                    qsTr("Interface"),
                    qsTr("Graphics"),
                    qsTr("Performance"),
                    qsTr("Files & Cloud"),
                    qsTr("Shortcuts")
                ]
                delegate: ItemDelegate {
                    width: parent.width
                    text: modelData
                    highlighted: ListView.isCurrentItem
                    onClicked: prefList.currentIndex = index
                }
            }
        }

        // Content Area
        StackLayout {
            currentIndex: prefList.currentIndex
            Layout.fillWidth: true
            Layout.fillHeight: true
            
            // General
            Pane {
                ColumnLayout {
                    Label { text: qsTr("General Settings"); color: "white"; font.bold: true }
                    CheckBox { text: qsTr("Auto-save every 5 minutes"); checked: true }
                    CheckBox { text: qsTr("Show splash screen at startup"); checked: true }
                }
            }

            // Interface
            Pane {
                ColumnLayout {
                    Label { text: qsTr("Interface Settings"); color: "white"; font.bold: true }
                    RowLayout {
                        Label { text: qsTr("UI Scale: ") }
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
                ColumnLayout {
                    Label { text: qsTr("Graphics / Viewport"); color: "white"; font.bold: true }
                    Label { text: qsTr("Rendering Backend:"); color: "#aaa" }
                    ComboBox {
                        model: ["Auto", "OpenGL", "Vulkan", "Software"]
                        Layout.fillWidth: true
                    }
                    CheckBox { text: qsTr("Enable Anti-aliasing (MSAA)"); checked: true }
                    CheckBox { text: qsTr("Vertical Sync (VSync)"); checked: true }
                }
            }

            // Fillers
            Repeater {
                model: 3
                Pane { Label { text: qsTr("Additional settings coming soon..."); color: "#666" } }
            }
        }
    }
}
