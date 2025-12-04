import { Route, ScanSearch, ShieldCheck, Brain } from "lucide-react";

const features = [
  {
    icon: Route,
    title: "Path Planning",
    description: "Advanced algorithms for efficient navigation and coverage of designated areas",
  },
  {
    icon: ScanSearch,
    title: "Object Detection",
    description: "AI-powered detection system to identify waste materials and debris",
  },
  {
    icon: ShieldCheck,
    title: "Obstacle Avoidance",
    description: "Smart sensors to navigate safely around people, furniture, and barriers",
  },
  {
    icon: Brain,
    title: "Machine Learning",
    description: "Adaptive learning to improve detection accuracy and efficiency over time",
  },
];

export function ProjectSection() {
  return (
    <section id="project" className="py-20 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Project Description
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Designing an autonomous cleaning robot for outdoor environments
          </p>
        </div>
        
        <div className="glass rounded-2xl p-8 shadow-card mb-12">
          <p className="text-lg text-foreground leading-relaxed mb-6">
            The cleaning bot will use object detection and path planning algorithms to identify and 
            navigate toward waste materials such as leaves, paper, or small plastic items. It will 
            feature obstacle avoidance to safely move around people, furniture, and other barriers 
            while maintaining efficient cleaning coverage.
          </p>
          <p className="text-lg text-foreground leading-relaxed mb-6">
            In addition to physical design, a simulation software model may be developed to demonstrate 
            how the robot navigates and performs its cleaning tasks. The system could also incorporate 
            machine learning or image recognition to improve detection accuracy over time.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            By automating cleaning tasks, this project aims to reduce the need for manual labor, 
            promote environmental cleanliness, and showcase the potential of robotics in everyday 
            problem-solving.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-6 shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 shadow-soft">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
