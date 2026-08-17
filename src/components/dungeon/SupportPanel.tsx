import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createSupportTicket, getUserTickets } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, MessageSquare, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function SupportPanel() {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const fetchTickets = useServerFn(getUserTickets);
  const submitTicket = useServerFn(createSupportTicket);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: () => fetchTickets(),
  });

  const mutation = useMutation({
    mutationFn: (data: { subject: string; message: string; priority: "low" | "medium" | "high" }) => 
      submitTicket({ data }),
    onSuccess: () => {
      toast.success("Support ticket sent successfully");
      setShowNew(false);
      setSubject("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    },
    onError: (err: any) => {
      toast.error("Failed to send ticket: " + err.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ subject, message, priority });
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <MessageSquare className="size-4" />
          Support Tickets
        </h2>
        <Button size="icon" variant="ghost" onClick={() => setShowNew(!showNew)} className="size-8">
          <Plus className={`size-4 transition-transform ${showNew ? 'rotate-45' : ''}`} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 panel-scroll">
        {showNew ? (
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Subject</label>
              <Input 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
                placeholder="Brief summary of the issue"
                required
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Priority</label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Message</label>
              <Textarea 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder="Describe your issue in detail..."
                required
                className="min-h-[100px] text-sm resize-none"
              />
            </div>
            <Button type="submit" className="w-full h-8 text-xs" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="size-3 animate-spin mr-2" /> : null}
              Send Ticket
            </Button>
          </form>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : tickets?.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground space-y-2">
            <MessageSquare className="size-8 mx-auto opacity-20" />
            <p className="text-xs">No active support tickets.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets?.map((t: any) => (
              <div key={t.id} className="p-3 rounded-md border border-border bg-card/50 space-y-2 hover:bg-card transition-colors">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                    t.status === 'open' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {t.status}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {new Date(t.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xs font-semibold">{t.subject}</h3>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{t.message}</p>
                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                   <span className="text-[9px] font-medium text-muted-foreground">Priority: {t.priority}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
