import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, Book, HelpCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";

import { DOCS_DATA } from "./docsData";
import { docsConfig } from "@/docs/config";

// Using static data from docsData.ts to avoid fetch errors during hydration
const useStaticDocs = (id: string) => {
  const section = DOCS_DATA.find((s) => s.id === id) || DOCS_DATA[0];
  return { content: section?.content || "", isLoading: false };
};

interface HelpCenterProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialSectionId?: string | null | undefined;
}

export const HelpCenter = ({ isOpen, onOpenChange, initialSectionId }: HelpCenterProps) => {
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDarkMode(document.documentElement.classList.contains("dark"));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    return () => observer.disconnect();
  }, []);

  const [activeId, setActiveId] = React.useState(initialSectionId || docsConfig.defaultSection);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    if (initialSectionId) {
      setActiveId(initialSectionId);
    }
  }, [initialSectionId]);

  const filteredSections = DOCS_DATA.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.keywords?.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const activeSection = DOCS_DATA.find((s) => s.id === activeId) || DOCS_DATA[0];
  const { content: markdown } = useStaticDocs(activeSection?.id || docsConfig.defaultSection);

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
                  key={section.id}
                  onClick={() => setActiveId(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between group ${
                    activeId === section.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{section.title}</span>
                  </div>
                  {activeId === section.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-8">
            <div
              className="max-w-3xl mx-auto prose prose-invert prose-slate 
              prose-headings:text-foreground prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-border prose-h2:pb-2
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-strong:text-foreground prose-strong:font-semibold
              prose-li:text-muted-foreground prose-li:marker:text-primary
              prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border prose-pre:rounded-lg
              prose-img:rounded-lg prose-img:shadow-lg
              prose-table:border prose-table:border-border prose-table:rounded-lg prose-table:overflow-hidden
              prose-th:bg-muted/50 prose-th:p-3 prose-th:text-left
              prose-td:p-3 prose-td:border-t prose-td:border-border
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-foreground
            "
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={isDarkMode ? vscDarkPlus : vs}
                        language={match[1]}
                        PreTag="div"
                        className={`rounded-lg !my-4 border border-border ${isDarkMode ? "!bg-zinc-950" : "!bg-zinc-50"}`}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {markdown || ""}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
