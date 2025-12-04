import { Clock, Leaf, Heart } from "lucide-react";

const benefits = [
  { icon: Clock, label: "Reduces Manual Labor" },
  { icon: Leaf, label: "Promotes Clean Communities" },
  { icon: Heart, label: "Increases Convenience" },
];

export function ProblemSection() {
  return (
    <section id="problem" className="py-20 px-4 gradient-hero">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Problem Statement
          </h2>
        </div>
        
        <div className="glass rounded-2xl p-8 shadow-card mb-10">
          <p className="text-lg text-foreground leading-relaxed mb-6">
            Maintaining clean and debris-free environments, such as yards, sidewalks, and public spaces, 
            is a time-consuming task that often requires constant human effort. Many individuals and 
            organizations lack the time, resources, or accessibility to perform regular cleaning tasks efficiently.
          </p>
          <p className="text-lg text-foreground leading-relaxed mb-6">
            Existing solutions like robotic vacuums are limited to indoor environments and cannot handle 
            outdoor conditions, larger debris, or varied terrain.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Therefore, there is a need for an autonomous cleaning robot capable of navigating designated 
            outdoor or semi-outdoor areas, identifying and collecting trash or debris, and disposing of 
            it efficiently—all while minimizing human intervention.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.label}
              className="glass rounded-xl p-4 flex items-center gap-3 shadow-card hover:shadow-soft transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">{benefit.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
