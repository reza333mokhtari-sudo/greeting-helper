export type DocSection = {
  slug: string
  title: string
  description: string
  order: number
  file: string
  keywords?: string[]
}

export const docSections: DocSection[] = [
  {
    slug: "quick-start",
    title: "Quick Start",
    description: "Learn the editor in 5 minutes.",
    order: 1,
    file: "quick-start.mdx",
    keywords: ["start", "begin", "intro"],
  },
  {
    slug: "interface",
    title: "Interface Overview",
    description: "Toolbar, panels, canvas, minimap.",
    order: 2,
    file: "interface.mdx",
  },
  {
    slug: "navigation",
    title: "Navigation",
    description: "Pan, zoom, reset view, minimap.",
    order: 3,
    file: "navigation.mdx",
  },
  {
    slug: "objects-and-props",
    title: "Objects & Props",
    description: "Place, move, and manage objects.",
    order: 4,
    file: "objects-and-props.mdx",
  },
  {
    slug: "editing-tools",
    title: "Editing Tools",
    description: "Core tools and right-click actions.",
    order: 5,
    file: "editing-tools.mdx",
  },
  {
    slug: "camera-and-views",
    title: "Camera & Views",
    description: "Camera mode, cube, Top/Left/Right views.",
    order: 6,
    file: "camera-and-views.mdx",
    keywords: ["cube", "top", "xyz", "rgb"],
  },
  {
    slug: "three-d-library",
    title: "3D Library",
    description: "Add objects without changing viewport.",
    order: 7,
    file: "three-d-library.mdx",
    keywords: ["3d", "library", "import", "glb"],
  },
  {
    slug: "minimap",
    title: "Minimap",
    description: "Locate and jump around the map.",
    order: 8,
    file: "minimap.mdx",
  },
  {
    slug: "save-export",
    title: "Save & Export",
    description: "Save progress and export outputs.",
    order: 9,
    file: "save-export.mdx",
  },
  {
    slug: "shortcuts",
    title: "Shortcuts",
    description: "Keyboard and mouse shortcuts.",
    order: 10,
    file: "shortcuts.mdx",
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    description: "Fix common editor issues.",
    order: 11,
    file: "troubleshooting.mdx",
  },
  {
    slug: "faq",
    title: "FAQ",
    description: "Frequent questions.",
    order: 12,
    file: "faq.mdx",
  },
]
