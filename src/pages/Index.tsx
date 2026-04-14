import { useMemo, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { TeamSection } from "@/components/TeamSection";
import { ProblemSection } from "@/components/ProblemSection";
import { ProjectSection } from "@/components/ProjectSection";
import { DashboardSection } from "@/components/DashboardSection";
import { UserStoriesSection } from "@/components/UserStoriesSection";
import { Footer } from "@/components/Footer";
import type { SiteTab } from "@/components/Navigation";

/**
 * Index component.
 * @returns The rendered Index component.
 */
const Index = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<SiteTab>("dashboard");

  const activeSection = useMemo(() => {
    switch (activeTab) {
      case "home":
        return <HeroSection />;
      case "team":
        return <TeamSection />;
      case "problem":
        return <ProblemSection />;
      case "project":
        return <ProjectSection />;
      case "stories":
        return <UserStoriesSection />;
      case "dashboard":
      default:
        return <DashboardSection />;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      {activeSection}
      <Footer />
    </div>
  );
};

export default Index;
