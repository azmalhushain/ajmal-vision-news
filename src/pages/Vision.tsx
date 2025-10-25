import { useEffect, useState } from "react";
import { Building2, Heart, GraduationCap, Users, Sprout, Laptop } from "lucide-react";
import { Footer } from "@/components/Footer";

const Vision = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  const areas = [
    {
      icon: Building2,
      title: "Infrastructure Development",
      items: [
        "Road construction and blacktopping",
        "Bridge and culvert construction",
        "Street lighting installation",
        "Public transportation improvement",
        "Municipal building construction",
      ],
    },
    {
      icon: Heart,
      title: "Healthcare Services",
      items: [
        "Health post upgrades and modernization",
        "Medical equipment procurement",
        "Health awareness programs",
        "Maternal and child health services",
        "Emergency medical services",
      ],
    },
    {
      icon: GraduationCap,
      title: "Education Enhancement",
      items: [
        "School building renovation",
        "Digital learning infrastructure",
        "Scholarship programs",
        "Teacher training programs",
        "Library and resource centers",
      ],
    },
    {
      icon: Users,
      title: "Youth & Women Empowerment",
      items: [
        "Skill development training",
        "Employment generation programs",
        "Women entrepreneurship support",
        "Youth leadership development",
        "Community development initiatives",
      ],
    },
    {
      icon: Sprout,
      title: "Agriculture Development",
      items: [
        "Modern farming techniques",
        "Irrigation system improvement",
        "Agricultural market access",
        "Farmer training programs",
        "Crop diversification support",
      ],
    },
    {
      icon: Laptop,
      title: "Digital Transformation",
      items: [
        "E-governance implementation",
        "Smart water supply systems",
        "Digital service delivery",
        "Municipal website development",
        "Online complaint system",
      ],
    },
  ];

  const projects = [
    {
      title: "Road Blacktopping Project",
      location: "Wards 5 & 6",
      progress: 65,
      status: "Ongoing",
      description: "Comprehensive road blacktopping covering major thoroughfares.",
    },
    {
      title: "Community Health Center",
      location: "Ward 3",
      progress: 80,
      status: "Ongoing",
      description: "Construction of modern community health center with advanced facilities.",
    },
    {
      title: "Smart Water Supply System",
      location: "All Wards",
      progress: 45,
      status: "Ongoing",
      description: "Implementation of smart water supply system with automated monitoring.",
    },
    {
      title: "Digital Library Initiative",
      location: "Ward 2",
      progress: 90,
      status: "Near Completion",
      description: "Establishing digital library with computer lab and internet access.",
    },
  ];

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4">
          <div
            className={`text-center max-w-3xl mx-auto transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-5xl lg:text-7xl font-black mb-6">
              <span className="block text-foreground">VISION &</span>
              <span className="block text-accent">DEVELOPMENT</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Comprehensive development plans and policies for a prosperous Bhokraha Narsingh.
            </p>
          </div>
        </div>
      </section>

      {/* Development Areas */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl lg:text-5xl font-black text-center mb-16">
            Key Development Areas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {areas.map((area, index) => {
              const Icon = area.icon;
              return (
                <div
                  key={area.title}
                  className={`glass-card glass-hover p-8 rounded-2xl fade-in-up animate-delay-${(index + 1) * 100}`}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-6 text-foreground">{area.title}</h3>
                  <ul className="space-y-3">
                    {area.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-muted-foreground">
                        <span className="text-accent mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ongoing Projects */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl lg:text-5xl font-black text-center mb-16">
            Ongoing Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div
                key={project.title}
                className={`glass-card glass-hover p-8 rounded-2xl fade-in-up animate-delay-${(index + 1) * 100}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-foreground">{project.title}</h3>
                  <span className="glass-card px-4 py-1 text-xs font-bold text-accent rounded-full">
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">📍 {project.location}</p>
                <p className="text-muted-foreground mb-6">{project.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-accent font-bold">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-1000 ease-out"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Vision;
