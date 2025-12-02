import { Hero } from "@/components/Hero";
import { VisionStatement } from "@/components/VisionStatement";
import { DevelopmentAreas } from "@/components/DevelopmentAreas";
import { NewsSection } from "@/components/NewsSection";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";

const Home = () => {
  return (
    <PageTransition>
      <div className="min-h-screen">
        <Hero />
        <VisionStatement />
        <DevelopmentAreas />
        <NewsSection />
        <Newsletter />
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Home;
