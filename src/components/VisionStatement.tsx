import { useEffect, useState } from "react";

export const VisionStatement = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById("vision-statement");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const stats = [
    { number: "100%", label: "Ward Coverage" },
    { number: "25+", label: "Infrastructure Projects" },
    { number: "8", label: "Health Posts Upgraded" },
  ];

  return (
    <section id="vision-statement" className="py-20 bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4">
        <div
          className={`text-center max-w-4xl mx-auto space-y-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-4xl lg:text-6xl font-black leading-tight">
            <span className="block text-foreground">I BELIEVE IN</span>
            <span className="block text-accent">PEOPLE-FIRST</span>
            <span className="block text-foreground">DEVELOPMENT</span>
          </h2>

          <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
            "जनताकै साथमा, जनताकै लागि" - With the people, for the people. Every
            decision, every project, every initiative is driven by the needs and
            aspirations of our citizens.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`glass-card glass-hover p-8 rounded-2xl fade-in-up animate-delay-${(index + 1) * 100}`}
              >
                <div className="text-5xl lg:text-6xl font-black text-accent mb-2">
                  {stat.number}
                </div>
                <div className="text-sm uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
