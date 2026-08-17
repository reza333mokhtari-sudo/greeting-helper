import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ONBOARDING_STEPS } from "@/lib/dungeon/onboarding";
import { ChevronRight, ChevronLeft, Sparkles, X } from "lucide-react";

export function OnboardingOverlay() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem("scrawl_onboarding_seen");
    if (!hasSeen) {
      setOpen(true);
    }
  }, []);

  const close = () => {
    localStorage.setItem("scrawl_onboarding_seen", "true");
    setOpen(false);
  };

  const current = ONBOARDING_STEPS[step];
  if (!current) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="sm:max-w-[420px] overflow-hidden border-primary/20 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="relative space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <svg
              viewBox="0 0 24 24"
              className="size-7"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={current.image} />
            </svg>
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-xl font-bold tracking-tight">{current.title}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {current.content}
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 size-8 opacity-50 hover:opacity-100"
            onClick={close}
          >
            <X className="size-4" />
          </Button>
        </DialogHeader>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          {ONBOARDING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-primary" : "w-2 bg-primary/20"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="mt-6 flex sm:justify-between items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-muted-foreground"
          >
            <ChevronLeft className="mr-1 size-4" /> Back
          </Button>

          {step < ONBOARDING_STEPS.length - 1 ? (
            <Button
              size="sm"
              onClick={() => setStep((s) => s + 1)}
              className="shadow-lg shadow-primary/20"
            >
              Continue <ChevronRight className="ml-1 size-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={close} className="bg-primary shadow-lg shadow-primary/20">
              <Sparkles className="mr-1 size-4" /> Just Start Drawing
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
