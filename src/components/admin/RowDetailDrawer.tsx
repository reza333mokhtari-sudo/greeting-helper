import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Code } from "lucide-react";
import { toast } from "sonner";

interface RowDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  row: any;
  tableName: string;
}

export function RowDetailDrawer({ isOpen, onClose, row, tableName }: RowDetailDrawerProps) {
  if (!row) return null;

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(row, null, 2));
    toast.success("JSON copied to clipboard");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl flex flex-col h-full p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-2">
            {tableName} Record
            <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase">
              {row.id?.slice(0, 8)}
            </code>
          </SheetTitle>
          <SheetDescription>Detailed view of the database record.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="grid gap-4">
              {Object.entries(row).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {key}
                  </dt>
                  <dd className="text-sm font-mono break-all bg-muted/30 p-2 rounded border border-border/40">
                    {value === null ? (
                      <span className="text-muted-foreground italic">null</span>
                    ) : typeof value === "object" ? (
                      <pre className="text-[10px] whitespace-pre-wrap">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      String(value)
                    )}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 border-t mt-auto">
          <div className="flex w-full justify-between items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyJson} className="text-xs">
              <Copy className="mr-2 h-3.5 w-3.5" />
              Copy JSON
            </Button>
            <Button onClick={onClose} size="sm" className="text-xs">
              Close
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
