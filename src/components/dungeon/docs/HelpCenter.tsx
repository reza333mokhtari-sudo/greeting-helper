import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, Book, HelpCircle, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { docSections, DocSection } from "@/docs/meta";
import { docsConfig } from "@/docs/config";

// Simulated MDX loader since we're using static files in this environment
const useMdxContent = (slug: string) => {
  const [content, setContent] = React.useState<string>("");
  
  React.useEffect(() => {
    // In a real MDX setup, this would be an import()
    // Here we fetch the local file content
    fetch(`/src/docs/content/${slug}.mdx`)
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(() => setContent("# Not Found\nThe requested documentation section could not be loaded."));
  }, [slug]);

  return content;
};

interface HelpCenterProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialSectionId?: string;
}

export const HelpCenter = ({ isOpen, onOpenChange, initialSectionId }: HelpCenterProps) => {
  const [activeId, setActiveId] = React.useState(initialSectionId || docsConfig.defaultSection);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    if (initialSectionId) {
      setActiveId(initialSectionId);
    }
  }, [initialSectionId]);

  const filteredSections = docSections.filter(section => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeSection = docSections.find(s => s.slug === activeId) || docSections[0];
  const markdown = useMdxContent(activeSection.slug);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] p-0 gap-0 overflow-hidden flex flex-col bg-background border-border">
        <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-primary" />
            <DialogTitle className="text-xl font-bold">{docsConfig.helpTitle}</DialogTitle>
          </div>
          <div className="relative w-64 mr-8">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={docsConfig.searchPlaceholder}
              className="pl-8 h-9 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-border bg-muted/20 overflow-y-auto p-2">
            <div className="space-y-1">
              {filteredSections.map((section) => (
                <button
                  key={section.slug}
                  onClick={() => setActiveId(section.slug)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between group ${
                    activeId === section.slug 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{section.title}</span>
                  </div>
                  {activeId === section.slug && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-8">
            <div className="max-w-3xl mx-auto prose prose-invert prose-slate prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-code:text-primary prose-pre:bg-muted/50 prose-img:rounded-lg">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
