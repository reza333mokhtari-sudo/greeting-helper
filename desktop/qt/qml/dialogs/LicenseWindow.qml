import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import DungeonEditor.Services 1.0
import "qrc:/qt/qml/DungeonEditor/qml/components"

BaseFloatingWindow {
    id: licenseWindow
    title: "LICENSE MANAGEMENT"
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
            DccLabel {
                text: "CURRENT LICENSE"
                font.bold: true
                color: "#888"
            }
            DccPanel {
                Layout.fillWidth: true
                height: 80
                color: "#161616"
                
                RowLayout {
                    anchors.fill: parent
                    anchors.margins: 15
                    
                    ColumnLayout {
                        spacing: 2
                        DccLabel {
                            text: licenseService.licenseType.toUpperCase()
                            font.pixelSize: 22
                            font.bold: true
                            color: licenseService.isActive ? "#f59e0b" : "#444"
                        }
                        DccLabel {
                            text: licenseService.isActive ? 
                                  "Duration: " + licenseService.monthsDuration + " Month(s)" : 
                                  "No active subscription"
                            font.pixelSize: 11
                            color: "#666"
                        }
                    }
                    
                    Item { Layout.fillWidth: true }
                    
                    ColumnLayout {
                        Layout.alignment: Qt.AlignRight
                        spacing: 2
                        DccLabel {
                            text: licenseService.isActive ? 
                                  licenseService.daysRemaining + " days remaining" : 
                                  "INACTIVE"
                            color: licenseService.isActive ? (licenseService.daysRemaining < 7 ? "#ef4444" : "#10b981") : "#444"
                            font.bold: true
                        }
                        DccLabel {
                            text: "Expires: " + (licenseService.isActive ? licenseService.expiryDate.toLocaleDateString() : "N/A")
                            font.pixelSize: 10
                            color: "#444"
                            Layout.alignment: Qt.AlignRight
                        }
                    }
                }
            }
        }

        ColumnLayout {
            spacing: 8
            DccLabel {
                text: "ACTIVATE LICENSE KEY"
                font.bold: true
                color: "#888"
            }
            DccTextField {
                id: keyInput
                Layout.fillWidth: true
                placeholderText: "XXXX-XXXX-XXXX-XXXX"
                font.family: "JetBrains Mono"
            }
            DccButton {
                text: licenseService.isSyncing ? "VERIFYING..." : "SAVE & VERIFY"
                Layout.fillWidth: true
                enabled: !licenseService.isSyncing && keyInput.text.length > 5
                onClicked: licenseService.activate(keyInput.text)
            }
        }
        
        DccLabel {
            id: statusLabel
            text: licenseService.isActive ? 
                  "Last sync: " + licenseService.lastSyncTime.toLocaleString() :
                  "Hardware ID: " + licenseService.hardwareId
            font.pixelSize: 10
            color: "#444"
            Layout.alignment: Qt.AlignHCenter
        }
        
        Item { Layout.fillHeight: true }
        
        DccButton {
            text: "DEACTIVATE LICENSE"
            flat: true
            visible: licenseService.isActive
            onClicked: licenseService.deactivate()
            Layout.alignment: Qt.AlignHCenter
            contentItem: DccLabel {
                text: "DEACTIVATE LICENSE"
                color: "#ef4444"
                font.pixelSize: 10
                font.underline: true
                horizontalAlignment: Text.AlignHCenter
            }
        }
    }
}
