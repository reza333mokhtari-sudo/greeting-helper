import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Check local storage or document class
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const isDark =
      savedTheme === "dark" || (!savedTheme && document.documentElement.classList.contains("dark"));

    setTheme(isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="size-8 text-foreground/60 hover:text-foreground transition-colors focus-visible:ring-1 focus-visible:ring-primary"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Sun className="size-[16px] animate-in zoom-in-50 duration-300" />
      ) : (
        <Moon className="size-[16px] animate-in zoom-in-50 duration-300" />
      )}
    </Button>
  );
}
