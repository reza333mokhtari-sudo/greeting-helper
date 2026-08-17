import { useEffect, useState } from "react";
import { FileText, Lock, Globe, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dialog } from "@/lib/dialog";
import { toast } from "sonner";

type Page = {
  id: string;
  slug: string;
  title: string;
  body: string;
  published: boolean;
  updated_at: string;
};

export function CmsPanel() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: role } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(!!role);
    };

    const fetchPages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("cms_pages")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching CMS pages:", error);
      } else {
        setPages((data as Page[]) || []);
      }
      setLoading(false);
    };

    checkAdmin();
    fetchPages();
  }, []);

  const openPage = async (page: Page) => {
    if (!page.published && !isAdmin) {
      toast.error("This page is private.");
      return;
    }

    await dialog.open({
      title: page.title,
      message: (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Badge variant={page.published ? "default" : "outline"}>
              {page.published ? (
                <Globe className="mr-1 h-3 w-3" />
              ) : (
                <Lock className="mr-1 h-3 w-3" />
              )}
              {page.published ? "Public" : "Private (Admin Only)"}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              Last updated: {new Date(page.updated_at).toLocaleDateString()}
            </span>
          </div>
          <div className="max-h-[60vh] overflow-auto rounded-md border border-border/40 bg-muted/20 p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {page.body}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" asChild>
              <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" /> View standalone
              </a>
            </Button>
          </div>
        </div>
      ) as any,
    });
  };

  const visiblePages = pages.filter((p) => p.published || isAdmin);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 pb-2">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          CMS Pages
        </h2>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 p-2">
          {visiblePages.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              No pages available.
            </div>
          ) : (
            visiblePages.map((page) => (
              <button
                key={page.id}
                onClick={() => openPage(page)}
                className="group flex w-full flex-col gap-1 rounded-md border border-transparent p-2 text-left transition-all hover:bg-muted/50 hover:border-border/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate text-xs font-medium">{page.title}</span>
                  </div>
                  {page.published ? (
                    <Globe className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                  ) : (
                    <Lock className="h-3 w-3 shrink-0 text-amber-500/80" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="font-mono">/p/{page.slug}</span>
                  <span>•</span>
                  <span>{new Date(page.updated_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
