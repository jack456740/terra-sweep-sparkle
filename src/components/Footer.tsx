import { Bot } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 px-4 bg-foreground text-background">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-heading font-bold text-lg">Clean Bot</span>
              <p className="text-sm opacity-70">Amazon FTR 5 • Howard University</p>
            </div>
          </div>
          
          <p className="text-sm opacity-70 text-center">
            © 2024 Clean Bot Project. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
