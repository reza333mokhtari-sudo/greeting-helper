import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import DungeonEditor.Services 1.0

BaseFloatingWindow {
    id: licenseWindow
    title: "License Management"
    width: 500
    height: 400
    
    LicenseService {
        id: licenseService
        onActivationSuccess: {
            statusLabel.text = "License activated successfully!"
            statusLabel.color = "#10b981"
        }
        onActivationFailed: (reason) => {
            statusLabel.text = "Activation failed: " + reason
            statusLabel.color = "#ef4444"
        }
    }
    
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 40
        spacing: 20
        
        ColumnLayout {
            spacing: 5
            Label {
                text: "Current License"
                font.bold: true
                color: "#888"
            }
            Rectangle {
                Layout.fillWidth: true
                height: 80
                color: "#1a1a1a" // ZBrush deep charcoal
                border.color: "#383838"
                border.width: 1
                radius: 1 // Sharp, blocky ZBrush corners
                
                RowLayout {
                    anchors.fill: parent
                    anchors.margins: 15
                    
                    ColumnLayout {
                        spacing: 2
                        Label {
                            text: licenseService.licenseType.toUpperCase()
                            font.pixelSize: 22
                            font.bold: true
                            color: licenseService.isActive ? "#3b82f6" : "#666"
                        }
                        Label {
                            text: licenseService.isActive ? 
                                  "Duration: " + licenseService.monthsDuration + " Month(s)" : 
                                  "No active subscription"
                            font.pixelSize: 11
                            color: "#888"
                        }
                    }
                    
                    Item { Layout.fillWidth: true }
                    
                    ColumnLayout {
                        Layout.alignment: Qt.AlignRight
                        spacing: 2
                        Label {
                            text: licenseService.isActive ? 
                                  licenseService.daysRemaining + " days remaining" : 
                                  "Inactive"
                            color: licenseService.daysRemaining < 7 ? "#ef4444" : "#10b981"
                            font.bold: true
                        }
                        Label {
                            text: "Expires: " + (licenseService.isActive ? licenseService.expiryDate.toLocaleDateString() : "N/A")
                            font.pixelSize: 10
                            color: "#666"
                            Layout.alignment: Qt.AlignRight
                        }
                    }
                }
            }
        }

        ColumnLayout {
            spacing: 8
            Label {
                text: "Activate License Key"
                font.bold: true
                color: "#888"
            }
            RowLayout {
                Layout.fillWidth: true
                spacing: 10
                TextField {
                    id: keyInput
                    Layout.fillWidth: true
                    placeholderText: "XXXX-XXXX-XXXX-XXXX"
                    color: "#eee"
                    font.family: "JetBrains Mono"
                    background: Rectangle {
                        color: "#1a1a1a"
                        border.color: keyInput.activeFocus ? "#f59e0b" : "#383838"
                        border.width: 1
                        radius: 1
                    }
                }
                Button {
                    text: "Paste"
                    onClicked: keyInput.text = "PRO-SAMPLE" // In real app use Clipboard
                    visible: false // Hidden as shortcut
                }
            }
            Button {
                text: licenseService.isSyncing ? "Verifying..." : "Save & Verify"
                Layout.fillWidth: true
                highlighted: true
                enabled: !licenseService.isSyncing && keyInput.text.length > 5
                onClicked: licenseService.activate(keyInput.text)
                
                contentItem: RowLayout {
                    spacing: 8
                    Item { Layout.fillWidth: true }
                    Label {
                        text: parent.parent.text
                        color: "#fff"
                        font.bold: true
                    }
                    BusyIndicator {
                        running: licenseService.isSyncing
                        visible: running
                        implicitWidth: 16
                        implicitHeight: 16
                    }
                    Item { Layout.fillWidth: true }
                }
            }
        }
        
        Label {
            id: statusLabel
            text: licenseService.isActive ? 
                  "Last sync: " + licenseService.lastSyncTime.toLocaleString() :
                  "Hardware ID: " + licenseService.hardwareId
            font.pixelSize: 11
            color: "#666"
            Layout.alignment: Qt.AlignHCenter
        }
        
        Item { Layout.fillHeight: true }
        
        Button {
            text: "Deactivate License"
            flat: true
            visible: licenseService.isActive
            onClicked: licenseService.deactivate()
            Layout.alignment: Qt.AlignHCenter
            contentItem: Label {
                text: "Deactivate License"
                color: "#ef4444"
                font.underline: true
            }
        }
    }
}
