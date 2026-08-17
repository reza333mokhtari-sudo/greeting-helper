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
        spacing: 25
        
        ColumnLayout {
            spacing: 5
            Label {
                text: "Current License"
                font.bold: true
                color: "#888"
            }
            Rectangle {
                Layout.fillWidth: true
                height: 60
                color: "#161616"
                border.color: "#2d2d2d"
                radius: 4
                
                RowLayout {
                    anchors.fill: parent
                    anchors.margins: 15
                    
                    Label {
                        text: licenseService.licenseType.toUpperCase()
                        font.pixelSize: 20
                        font.bold: true
                        color: licenseService.isActive ? "#3b82f6" : "#666"
                    }
                    
                    Item { Layout.fillWidth: true }
                    
                    Label {
                        text: licenseService.isActive ? 
                              licenseService.daysRemaining + " days remaining" : 
                              "Inactive"
                        color: "#888"
                    }
                }
            }
        }
        
        ColumnLayout {
            spacing: 10
            Label {
                text: "Activate License Key"
                font.bold: true
                color: "#888"
            }
            TextField {
                id: keyInput
                Layout.fillWidth: true
                placeholderText: "XXXX-XXXX-XXXX-XXXX"
                color: "#eee"
                background: Rectangle {
                    color: "#161616"
                    border.color: keyInput.activeFocus ? "#3b82f6" : "#2d2d2d"
                }
            }
            Button {
                text: "Activate"
                Layout.fillWidth: true
                highlighted: true
                onClicked: licenseService.activate(keyInput.text)
            }
        }
        
        Label {
            id: statusLabel
            text: "Hardware ID: " + licenseService.hardwareId
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
        }
    }
}
