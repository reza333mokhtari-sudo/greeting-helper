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
                            case "intro": return "Welcome to Dungeon Scrawl, the ultimate mapping tool for professional game masters. This guide will walk you through creating your first map, using procedural generators, and exporting for print or digital play.\n\n### First Steps\n1. Click 'New Map' on the welcome screen.\n2. Use the 'Room' tool (R) to define your layout.\n3. Add details from the Asset Browser.\n\n### Professional Workflow\nThe 'Arcane Autodesk' design philosophy ensures a compact, high-efficiency interface. Use the ToolRail on the left for creation and the RightDock for properties.";
                            case "tools": return "### Tools Overview\n- **Select (Q)**: Manipulate existing objects. Use W/E/R for Move/Scale/Rotate hotkeys (Professional Mode).\n- **Room (R)**: Draw rectangular or polygonal rooms. Hold Shift for square snapping.\n- **Corridor (C)**: Connect rooms with snapping paths. Double-click to finish a path.\n- **Eraser (E)**: Remove walls or terrain details. Adjust size in the tool settings.\n- **Prop Brush (P)**: Quickly place atmospheric items. Scroll to rotate the prop before placing.";
                            case "proc": return "### Procedural Generation\nDungeon Scrawl features an advanced WFC (Wave Function Collapse) engine for generating complex layouts. \n\n1. Open the **Procedural** panel in the RightDock.\n2. Choose a generator type (Dungeon, Cave, or Urban).\n3. Adjust the 'Complexity' and 'Density' sliders.\n4. Click 'Generate' to see the magic happen.\n\n*Tip: Use the AI Assistant to refine generated layouts with natural language.*";
                            case "layers": return "### Layers & Objects\nOrganization is key to complex map design. The Outliner (RightDock) allows you to manage object hierarchy.\n\n- **Groups**: Organize related props (e.g., 'Furniture', 'Lighting').\n- **Visibility**: Toggle the eye icon to hide layers for player-facing versions.\n- **Locking**: Prevent accidental movement of large floor pieces.";
                            case "keys": return "### Keyboard Shortcuts (Maya/Blender Style)\n- **Q**: Select Tool\n- **W**: Move / Translate\n- **E**: Scale / Resize\n- **R**: Rotate\n- **D**: Duplicate Selection\n- **F**: Fit Selection to View\n- **Space**: Hold to Pan\n- **Ctrl+S**: Manual Save to .ds file";
                            case "ai": return "### AI Assistant Interface\nThe AI panel (Alt+A) provides a bridge between imagination and implementation.\n\n- **Prompting**: Type commands like 'Add a circular library with stone walls'.\n- **Refinement**: Select a room and say 'Make this room look like a laboratory'.\n- **Safety**: The AI cartographer respects existing layouts and will not overwrite locked objects.";
                            case "license": return "### License & Support\nDungeon Scrawl Professional supports several license tiers managed via the Admin Control Center.\n\n- **Trial**: 30-day access to all features.\n- **Pro**: Annual license for individuals.\n- **Enterprise**: Multi-seat licensing for studios.\n\nIf you encounter issues, please use the 'Admin Support' ticket system in the profile menu.";
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
