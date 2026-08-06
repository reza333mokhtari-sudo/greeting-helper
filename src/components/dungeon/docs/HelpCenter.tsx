import { useState, useMemo, useEffect } from "react";
import { Search, Book, ChevronRight, HelpCircle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DOCS_DATA, type DocSection } from "./docsData";
import ReactMarkdown from "react-markdown";

interface HelpCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSectionId?: string | null;
}

export function HelpCenter({ open, onOpenChange, initialSectionId }: HelpCenterProps) {
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string>("quick-start");

  // Sync activeId when initialSectionId changes or modal opens
  useEffect(() => {
    if (open && initialSectionId) {
      setActiveId(initialSectionId);
    }
  }, [open, initialSectionId]);

  const filteredDocs = useMemo(() => {
    if (!search) return DOCS_DATA;
    const s = search.toLowerCase();
    return DOCS_DATA.filter(d => 
      d.title.toLowerCase().includes(s) || 
      d.content.toLowerCase().includes(s) ||
      d.keywords.some(k => k.toLowerCase().includes(s))
    );
  }, [search]);

  const activeDoc = useMemo(() => 
    DOCS_DATA.find(d => d.id === activeId) || DOCS_DATA[0]!,
  [activeId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden border-border bg-card">
        <DialogHeader className="p-4 border-b bg-sidebar shrink-0 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-arcane" />
            <DialogTitle className="text-lg font-bold tracking-tight">Help Center</DialogTitle>
          </div>
          <div className="relative w-64 mr-8">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search topics..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-background/50 border-muted-foreground/20"
            />
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r bg-sidebar/50 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveId(doc.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors flex items-center justify-between group ${
                      activeId === doc.id 
                        ? "bg-arcane text-white font-medium" 
                        : "hover:bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{doc.title}</span>
                    <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${activeId === doc.id ? "opacity-100" : ""}`} />
                  </button>
                ))}
                {filteredDocs.length === 0 && (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No topics found for "{search}"
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col bg-background">
            <ScrollArea className="flex-1">
              <div className="p-8 max-w-2xl mx-auto">
                <div className="mb-6 flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-[10px] py-0 px-2 h-5 border-arcane/30 text-arcane">
                    {activeDoc.category}
                  </Badge>
                  {activeDoc.id === "quick-start" && <Badge className="bg-amber-500 text-black text-[10px] py-0 px-2 h-5">Recommended</Badge>}
                </div>
                
                <h1 className="text-3xl font-bold mb-6 tracking-tight text-foreground">{activeDoc.title}</h1>
                
                <div className="prose prose-invert prose-sm max-w-none 
                  prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:list-disc prose-li:text-muted-foreground
                  prose-table:border prose-table:border-border prose-th:bg-sidebar prose-th:p-2 prose-td:p-2 prose-td:border-b prose-td:border-border">
                  <ReactMarkdown>{activeDoc.content}</ReactMarkdown>
                </div>


                {/* Illustrated Step Placeholder (Visual Style Reference) */}
                <div className="mt-12 p-6 rounded-xl border-2 border-dashed border-muted-foreground/10 bg-muted/5 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-arcane/10 flex items-center justify-center mb-4">
                    <HelpCircle className="w-6 h-6 text-arcane" />
                  </div>
                  <p className="text-xs text-muted-foreground max-w-[240px]">
                    Step illustration coming soon. Follow the instructions above to shape your dungeon!
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
