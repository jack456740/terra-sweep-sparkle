import { cn } from "@/lib/utils";

const teamMembers = [
  { name: "Alvin Rogers", role: "Team Member", initials: "AR" },
  { name: "Carolyn Winn", role: "Team Member", initials: "CW" },
  { name: "Nicasio Smith", role: "Team Member", initials: "NS" },
  { name: "Jaleel Williams", role: "Team Member", initials: "JW" },
];

export function TeamSection() {
  return (
    <section id="team" className="py-20 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Team
          </h2>
          <p className="text-muted-foreground">
            Amazon FTR 5 • Howard University
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={member.name}
              className={cn(
                "glass rounded-2xl p-6 text-center shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-heading font-bold text-lg">
                {member.initials}
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-1">
                {member.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
