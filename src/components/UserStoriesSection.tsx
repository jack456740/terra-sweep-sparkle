import { Home, Shield, Leaf, Briefcase, GraduationCap, Bell, ScanSearch, BatteryCharging } from "lucide-react";

const stories = [
  {
    icon: Home,
    title: "Busy Homeowner",
    description: "As a busy homeowner with limited time, I want a robot that can automatically pick up debris so I can maintain a clean yard without manual effort.",
  },
  {
    icon: Shield,
    title: "Beach Security Officer",
    description: "As a beach security officer responsible for ensuring public safety, I want a robot that can help maintain cleanliness along the shoreline.",
  },
  {
    icon: Leaf,
    title: "Environmentalist Group",
    description: "As an environmentalist group dedicated to preserving coastal ecosystems, I want a robot that can efficiently collect debris without harming wildlife.",
  },
  {
    icon: Briefcase,
    title: "Groundskeeper",
    description: "As a groundskeeper who has multiple tasks to maintain a property, I want a robot that can handle debris collection autonomously.",
  },
  {
    icon: GraduationCap,
    title: "University President",
    description: "As the president of Howard University, I envision a robot that can automatically maintain campus cleanliness and showcase innovation.",
  },
  {
    icon: Bell,
    title: "Homeowner - Notifications",
    description: "As a homeowner, I want the robot to send me notifications or status updates when it completes tasks or encounters issues.",
  },
  {
    icon: ScanSearch,
    title: "Homeowner - Detection",
    description: "As a homeowner, I want the robot to detect and collect leaves, small debris, and recyclable items efficiently.",
  },
  {
    icon: BatteryCharging,
    title: "Homeowner - Charging",
    description: "As a homeowner, I want the robot to return to its charging dock automatically when battery is low.",
  },
];

export function UserStoriesSection() {
  return (
    <section id="stories" className="py-20 px-4 gradient-hero">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            User Stories
          </h2>
          <p className="text-muted-foreground">
            Understanding our users' needs and expectations
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stories.map((story) => (
            <div
              key={story.title}
              className="glass rounded-xl p-5 shadow-card hover:shadow-soft transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <story.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2 text-sm">
                {story.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {story.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
