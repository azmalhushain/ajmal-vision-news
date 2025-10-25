import { useEffect, useState } from "react";
import { Handshake, Users, Lightbulb, Heart, Leaf, Star } from "lucide-react";
import mayorImage from "@/assets/news-education.jpg";
import { Footer } from "@/components/Footer";

const About = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  const values = [
    {
      icon: Handshake,
      title: "Transparency",
      description: "Open and accountable governance with clear communication of all municipal activities.",
    },
    {
      icon: Users,
      title: "Inclusivity",
      description: "Ensuring development benefits reach every citizen, regardless of background.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Embracing modern technology and creative solutions to community challenges.",
    },
    {
      icon: Heart,
      title: "Service",
      description: "Dedicated public service focused on improving quality of life for all residents.",
    },
    {
      icon: Leaf,
      title: "Sustainability",
      description: "Development that meets present needs while preserving resources for future generations.",
    },
    {
      icon: Star,
      title: "Excellence",
      description: "Striving for the highest standards in all municipal services and projects.",
    },
  ];

  const achievements = [
    { number: "25+", title: "Infrastructure Projects", description: "Road construction, bridge building, and public facilities." },
    { number: "8", title: "Health Posts Upgraded", description: "Modernized healthcare facilities with new equipment." },
    { number: "15", title: "Schools Renovated", description: "Improved educational infrastructure with digital resources." },
    { number: "500+", title: "Families Benefited", description: "Direct impact through various development programs." },
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
              <span className="block text-foreground">MEET</span>
              <span className="block text-accent">AJMAL AKHTAR AZAD</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A dedicated public servant committed to transforming Bhokraha Narsingh through inclusive development and transparent governance.
            </p>
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 fade-in-up">
              <h2 className="text-4xl font-black text-foreground">The Journey</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Born and raised in Bhokraha Narsingh, Mayor Ajmal Akhtar Azad has deep roots in the community he serves. His journey from a local resident to the Mayor of Bhokraha Narsingh Municipality represents the power of community engagement and democratic participation.
                </p>
                <p>
                  With a strong educational background and years of experience in community development, Mayor Azad brings a unique blend of local knowledge and modern governance principles to his role. His commitment to "जनताकै साथमा, जनताकै लागि" (With the people, for the people) is not just a slogan but a guiding principle.
                </p>
                <p>
                  As a member of the Nepali Congress Party, Mayor Azad believes in inclusive development that benefits all sections of society. His vision extends beyond traditional municipal services to encompass comprehensive community development, digital transformation, and sustainable growth.
                </p>
              </div>
            </div>
            <div className="relative group fade-in-up animate-delay-300">
              <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-2xl group-hover:bg-accent/30 transition-all duration-500" />
              <img
                src={mayorImage}
                alt="Mayor Ajmal Akhtar Azad"
                className="relative rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl lg:text-5xl font-black text-center mb-16">
            Mission & Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className={`glass-card glass-hover p-8 rounded-2xl fade-in-up animate-delay-${(index + 1) * 100}`}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl lg:text-5xl font-black text-center mb-16">
            Key Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.title}
                className={`glass-card glass-hover p-8 rounded-2xl text-center fade-in-up animate-delay-${(index + 1) * 100}`}
              >
                <div className="text-5xl font-black text-accent mb-4">{achievement.number}</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;