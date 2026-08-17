import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

BaseFloatingWindow {
    title: "Dungeon Scrawl Documentation"
    width: 900
    height: 700
    
    RowLayout {
        anchors.fill: parent
        spacing: 0
        
        // Sidebar
        Rectangle {
            Layout.fillHeight: true
            Layout.preferredWidth: 220
            color: "#0f0f0f"
            border.color: "#1e1e1e"
            
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 15
                
                TextField {
                    placeholderText: "Search Docs..."
                    Layout.fillWidth: true
                    Layout.bottomMargin: 10
                }
                
                ListView {
                    id: navList
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    model: [
                        { "title": "Getting Started", "id": "intro" },
                        { "title": "Drawing Tools", "id": "tools" },
                        { "title": "Procedural Generation", "id": "proc" },
                        { "title": "Layers & Objects", "id": "layers" },
                        { "title": "Keyboard Shortcuts", "id": "keys" },
                        { "title": "AI Assistant", "id": "ai" },
                        { "title": "License & Support", "id": "license" }
                    ]
                    delegate: ItemDelegate {
                        width: parent.width
                        highlighted: ListView.isCurrentItem
                        contentItem: Label {
                            text: modelData.title
                            color: highlighted ? "white" : "#aaa"
                            font.bold: highlighted
                        }
                        onClicked: navList.currentIndex = index
                    }
                }
            }
        }
        
        // Content
        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            
            ColumnLayout {
                width: parent.width
                spacing: 20
                anchors.margins: 40
                
                Label {
                    text: navList.model[navList.currentIndex].title
                    font.pixelSize: 32
                    font.bold: true
                    color: "#eee"
                }
                
                Rectangle {
                    Layout.fillWidth: true
                    height: 1
                    color: "#2d2d2d"
                }
                
                Label {
                    Layout.fillWidth: true
                    wrapMode: Text.WordWrap
                    color: "#ccc"
                    lineHeight: 1.4
                    font.pixelSize: 14
                    text: {
                        switch(navList.model[navList.currentIndex].id) {
                            case "intro": return "Welcome to Dungeon Scrawl, the ultimate mapping tool for professional game masters. This guide will walk you through creating your first map, using procedural generators, and exporting for print or digital play.\n\n### First Steps\n1. Click 'New Map' on the welcome screen.\n2. Use the 'Room' tool (R) to define your layout.\n3. Add details from the Asset Browser.";
                            case "tools": return "### Tools Overview\n- **Select (Q)**: Manipulate existing objects.\n- **Room (R)**: Draw rectangular or polygonal rooms.\n- **Corridor (C)**: Connect rooms with snapping paths.\n- **Eraser (E)**: Remove walls or terrain details.\n- **Prop Brush (P)**: Quickly place atmospheric items.";
                            case "proc": return "### Procedural Generation\nDungeon Scrawl features an advanced WFC (Wave Function Collapse) engine for generating complex layouts. Access the 'Procedural' tab in the right dock to set constraints and generate infinite variations.";
                            default: return "Content for this section is being dynamically generated from the documentation server. Please ensure you are connected to the internet for the latest updates.";
                        }
                    }
                }
                
                Rectangle {
                    Layout.fillWidth: true
                    height: 200
                    color: "#161616"
                    border.color: "#2d2d2d"
                    Label {
                        anchors.centerIn: parent
                        text: "SCREENSHOT PLACEHOLDER"
                        color: "#333"
                    }
                }
            }
        }
    }
}
