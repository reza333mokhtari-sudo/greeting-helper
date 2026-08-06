import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HelpButtonProps {
  onClick: () => void;
  className?: string;
  sectionId?: string;
  label?: string;
}

export function HelpButton({ onClick, className, sectionId, label }: HelpButtonProps) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 rounded-full hover:bg-primary/20 hover:text-primary transition-all pointer-events-auto ${className}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
          }}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span className="sr-only">Help {label ? `for ${label}` : ""}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="text-[10px] bg-popover text-popover-foreground border-border z-[100]"
      >
        Learn more about {label || "this feature"}
      </TooltipContent>
    </Tooltip>
  );
}
