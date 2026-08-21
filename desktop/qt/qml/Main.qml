import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import QtQuick.Dialogs
import DungeonEditor.Core 1.0
import DungeonEditor.Canvas 1.0
import DungeonEditor.Models 1.0
import DungeonEditor.Services 1.0
import DungeonEditor.components
import DungeonEditor.panels
import DungeonEditor.dialogs

ApplicationWindow {
    id: window
    width: 1400
    height: 900
    visible: true
    title: "DUNGEON SCRAWL - Professional Editor"
    
    background: Rectangle { color: "#1a1a1a" } // ZBrush-style deep charcoal

    Document { id: mapDoc }
    AssetLibraryModel { id: assetModel }
    FileService { id: fileService }
    WorkspaceService { id: workspaceService }
    AiClient { id: aiClient }
    LicenseService { id: licenseService }

    WelcomeWindow { id: welcomeWindow }
    HelpWindow { id: helpWindow }
    AboutWindow { id: aboutWindow }
    LicenseWindow { id: licenseWindow }

    PreferencesDialog {
        id: preferencesDialog
    }

    
    FileDialog {
        id: openDialog
        title: "Open Map"
        nameFilters: ["Map files (*.json)", "All files (*)"]
        onAccepted: {
            mapDoc.load(selectedFile)
        }
    }

    FileDialog {
        id: saveDialog
        title: "Save Map"
        fileMode: FileDialog.SaveFile
        nameFilters: ["Map files (*.json)", "All files (*)"]
        onAccepted: {
            mapDoc.save(selectedFile)
        }
    }

    Component.onCompleted: {
        console.log("Dungeon Scrawl Desktop Shell Initialized");
        assetModel.loadManifest("qrc:/qt/qml/DungeonEditor/assets/soulslike/manifest.json");
        loadWorkspace("Default");
        
        // Auto-show welcome screen if not disabled
        let showWelcome = (typeof workspaceService !== "undefined") ? workspaceService.loadLayout("Settings").showWelcome !== false : true;
        if (showWelcome) {
            welcomeWindow.show();
        }
    }

    function saveWorkspace(name) {
        let layout = {
            "toolBoxWidth": toolBox.width,
            "rightDockWidth": rightDock.width,
            "aiPanelHeight": rightDock.aiPanelHeight
        };
        if (typeof workspaceService !== "undefined") workspaceService.saveLayout(name, layout);
    }

    function loadWorkspace(name) {
        if (typeof workspaceService === "undefined") return;
        let layout = workspaceService.loadLayout(name);
        if (Object.keys(layout).length > 0) {
            toolBox.width = layout.toolBoxWidth || 50;
            rightDock.width = layout.rightDockWidth || 380;
            rightDock.aiPanelHeight = layout.aiPanelHeight || 250;
        }
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 0
        
        // 1. Menu Bar
        TopBar {
            id: topBar
            Layout.fillWidth: true
            document: mapDoc
            canvas: canvas
            
        }

        // 2. Performance Status Line
        Rectangle {
            Layout.fillWidth: true
            height: 22
            color: "#1a1a1a"
            
            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 8
                spacing: 12
                
                DccLabel { text: "RENDER FPS: 60"; color: "#10b981"; font.pixelSize: 9; font.bold: true }
                DccLabel { text: "|"; color: "#333" }
                DccLabel { text: "MEMORY: 242MB"; color: "#aaa"; font.pixelSize: 9 }
                DccLabel { text: "|"; color: "#333" }
                DccLabel { text: mapDoc.dirty ? "MODIFIED" : "SAVED"; color: mapDoc.dirty ? "#f59e0b" : "#666"; font.pixelSize: 9 }
                
                Item { Layout.fillWidth: true }
            }
        }


        // 3. Shelf
        MayaShelf {
            id: shelf
            Layout.fillWidth: true
            document: mapDoc
            canvas: canvas
        }
        
        SplitView {
            id: mainSplit
            Layout.fillWidth: true
            Layout.fillHeight: true
            orientation: Qt.Horizontal
            
            handle: Rectangle {
                implicitWidth: 1
                color: "#2d2d2d"
            }



            // 4. Left Tool Box
            MayaToolBox {
                id: toolBox
                SplitView.minimumWidth: 48
                SplitView.preferredWidth: 48
                canvas: canvas
            }
            
            Item {
                SplitView.fillWidth: true
                clip: true
                
                // Viewport Toolbar
                Rectangle {
                    id: viewportToolbar
                    z: 10
                    width: parent.width
                    height: 32
                    color: "#cc161616"
                    RowLayout {
                        anchors.fill: parent
                        anchors.leftMargin: 10
                        spacing: 12
                        
                        RowLayout {
                            spacing: 4
                            AppIcon { icon: "status/help"; size: 14; color: "#f59e0b" }
                            DccLabel { text: "PERSPECTIVE"; color: "#eee"; font.pixelSize: 10; font.bold: true }
                        }


                        Rectangle { width: 1; height: 16; color: "#333" }

                        ToolButton { 
                            contentItem: AppIcon { icon: "tools/grid"; size: 14; active: mapDoc.gridVisible }
                            checkable: true
                            checked: mapDoc.gridVisible
                            onToggled: mapDoc.gridVisible = checked
                        }
                        
                        Item { Layout.fillWidth: true }
                        
                        DccLabel { text: "60 FPS"; color: "#10b981"; font.pixelSize: 9; font.family: "Monospace"; font.bold: true }
                    }
                }

                MapCanvasItem {
                    id: canvas
                    anchors.top: viewportToolbar.bottom
                    anchors.bottom: parent.bottom
                    anchors.left: parent.left
                    anchors.right: parent.right
                    document: mapDoc
                    onSelectionChanged: (id) => rightDock.updateInspector(id)
                }
            }
            
            // 5. Right Docks
            RightDock {
                id: rightDock
                SplitView.minimumWidth: 300
                SplitView.preferredWidth: 360
                document: mapDoc
                canvas: canvas
                assetModel: assetModel
            }
        }
        
        // 6. Advanced Status Bar
        AdvancedStatusBar {
            Layout.fillWidth: true
            canvas: canvas
            document: mapDoc
        }
    }

    BuildNotification {
        id: buildNotifier
        anchors.bottom: parent.bottom
        anchors.right: parent.right
        anchors.margins: 40
        z: 1000
    }
}

