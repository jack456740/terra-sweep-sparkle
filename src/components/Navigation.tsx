import { Bot, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type SiteTab = "dashboard" | "home" | "team" | "problem" | "project" | "stories";

const navLinks: { label: string; tab: SiteTab }[] = [
  { label: "Dashboard", tab: "dashboard" },
  { label: "Home", tab: "home" },
  { label: "Team", tab: "team" },
  { label: "Problem", tab: "problem" },
  { label: "Project", tab: "project" },
  { label: "User Stories", tab: "stories" },
];

interface NavigationProps {
  activeTab: SiteTab;
  onTabChange: (tab: SiteTab) => void;
}

/**
 * Navigation component.
 * @returns The rendered Navigation component.
 */
export function Navigation({ activeTab, onTabChange }: NavigationProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onTabChange("dashboard")}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">Clean Bot</span>
          </button>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.tab}
                onClick={() => onTabChange(link.tab)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                  activeTab === link.tab
                    ? "text-foreground bg-secondary/70"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => onTabChange("dashboard")}
              className="ml-2 px-4 py-2 text-sm font-medium gradient-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Control Panel
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <nav className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          isOpen ? "max-h-96 mt-4" : "max-h-0"
        )}>
          <div className="flex flex-col gap-2 pb-4">
            {navLinks.map((link) => (
              <button
                key={link.tab}
                onClick={() => {
                  onTabChange(link.tab);
                  setIsOpen(false);
                }}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-colors rounded-lg text-left",
                  activeTab === link.tab
                    ? "text-foreground bg-secondary/70"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {link.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
