import { Bot, ChevronDown } from "lucide-react";

export function HeroSection() {
  return (
    <section id="home" className="min-h-screen flex flex-col items-center justify-center relative gradient-hero px-4 py-20">
      <div className="text-center max-w-3xl mx-auto animate-fade-in">
        <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-glow animate-float">
          <Bot className="h-10 w-10 text-primary-foreground" />
        </div>
        
        <h1 className="font-heading text-5xl md:text-7xl font-bold text-foreground mb-4">
          Clean Bot
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-6">
          Autonomous Cleaning Robot
        </p>
        
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <span className="text-sm font-medium text-primary">
            Amazon FTR 5 • Howard University
          </span>
        </div>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          An innovative autonomous robot designed to navigate, identify, and collect debris 
          in outdoor and semi-outdoor environments—reducing manual labor and promoting cleaner communities.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#project"
            className="px-8 py-3 gradient-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-soft hover:shadow-glow"
          >
            Explore Project
          </a>
          <a
            href="#team"
            className="px-8 py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors border border-border"
          >
            Meet the Team
          </a>
        </div>
      </div>
      
      <a 
        href="#team" 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary animate-bounce"
      >
        <ChevronDown className="h-8 w-8" />
      </a>
    </section>
  );
}
