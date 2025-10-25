import { Hero } from "@/components/Hero";
import { VisionStatement } from "@/components/VisionStatement";
import { DevelopmentAreas } from "@/components/DevelopmentAreas";
import { NewsSection } from "@/components/NewsSection";
import { Footer } from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <VisionStatement />
      <DevelopmentAreas />
      <NewsSection />
      <Footer />
    </div>
  );
};

export default Home;
