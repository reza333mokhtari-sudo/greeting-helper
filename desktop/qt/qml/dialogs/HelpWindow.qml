import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import DungeonEditor.components

BaseFloatingWindow {
    title: "DOCUMENTATION"
    width: 900
    height: 700
    
    RowLayout {
        anchors.fill: parent
        spacing: 0
        
        // Sidebar
        DccPanel {
            Layout.fillHeight: true
            Layout.preferredWidth: 220
            color: "#0f0f0f"
            
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 15
                
                DccTextField {
                    placeholderText: "Search Docs..."
                    Layout.fillWidth: true
                    Layout.bottomMargin: 10
                }
                
                ListView {
                    id: navList
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    model: [
                        { "title": "GETTING STARTED", "id": "intro" },
                        { "title": "DRAWING TOOLS", "id": "tools" },
                        { "title": "PROCEDURAL GENERATION", "id": "proc" },
                        { "title": "LAYERS & OBJECTS", "id": "layers" },
                        { "title": "KEYBOARD SHORTCUTS", "id": "keys" },
                        { "title": "AI ASSISTANT", "id": "ai" },
                        { "title": "LICENSE & SUPPORT", "id": "license" }
                    ]
                    delegate: ItemDelegate {
                        width: parent.width
                        height: 36
                        highlighted: ListView.isCurrentItem
                        contentItem: DccLabel {
                            text: modelData.title
                            color: highlighted ? "#f59e0b" : "#888"
                            font.bold: highlighted
                            font.pixelSize: 10
                            verticalAlignment: Text.AlignVCenter
                        }
                        onClicked: navList.currentIndex = index
                        background: Rectangle { color: highlighted ? "#1a1a1a" : "transparent" }
                    }
                }
            }
        }
        
        // Content
        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            
            DccPanel {
                width: parent.width
                implicitHeight: contentCol.height + 80
                color: "#0a0a0a"

                ColumnLayout {
                    id: contentCol
                    anchors.left: parent.left
                    anchors.right: parent.right
                    anchors.top: parent.top
                    anchors.margins: 40
                    spacing: 20
                    
                    DccLabel {
                        text: navList.model[navList.currentIndex].title
                        font.pixelSize: 28
                        font.bold: true
                        color: "#eee"
                    }
                    
                    Rectangle {
                        Layout.fillWidth: true
                        height: 1
                        color: "#383838"
                    }
                    
                    DccLabel {
                        Layout.fillWidth: true
                        wrapMode: Text.WordWrap
                        color: "#aaa"
                        lineHeight: 1.4
                        font.pixelSize: 13
                        text: {
                            switch(navList.model[navList.currentIndex].id) {
                                case "intro": return "Welcome to the professional engine interface. This environment is designed for maximum efficiency in dungeon cartography.\n\n### CORE WORKFLOW\n1. Initialize workspace with 'New Map'.\n2. Use Geometry Shelf for structural layout.\n3. Detail with Prop Browser and Sculpting tools.\n\n### DCC STANDARDS\nThe interface follows industry-standard DCC patterns (Charcoal/Slate/Gold). Custom keybindings mimic high-end 3D suites for rapid iteration.";
                                case "tools": return "### TOOLSET\n- **Select (Q)**: Object manipulation and hierarchy selection.\n- **Translate (W)**: Move elements across the coordinate plane.\n- **Scale (E)**: Resize geometry and assets.\n- **Rotate (R)**: Adjust orientation.\n- **Room (Shift+R)**: Define floor geometry.";
                                default: return "Documentation content is being synchronized with the core library...";
                            }
                        }
                    }
                    
                    DccPanel {
                        Layout.fillWidth: true
                        height: 200
                        color: "#161616"
                        DccLabel {
                            anchors.centerIn: parent
                            text: "VIEWPORT PREVIEW"
                            color: "#333"
                            font.bold: true
                        }
                    }
                }
            }
        }
    }
}
