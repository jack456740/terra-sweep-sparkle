import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { TeamSection } from "@/components/TeamSection";
import { ProblemSection } from "@/components/ProblemSection";
import { ProjectSection } from "@/components/ProjectSection";
import { DashboardSection } from "@/components/DashboardSection";
import { UserStoriesSection } from "@/components/UserStoriesSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <TeamSection />
      <ProblemSection />
      <ProjectSection />
      <DashboardSection />
      <UserStoriesSection />
      <Footer />
    </div>
  );
};

export default Index;
