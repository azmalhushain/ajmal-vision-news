import { Hero } from "@/components/Hero";
import { VisionStatement } from "@/components/VisionStatement";
import { DevelopmentAreas } from "@/components/DevelopmentAreas";
import { NewsSection } from "@/components/NewsSection";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import ogHome from "@/assets/og-home.jpg";

const Home = () => {
  return (
    <PageTransition>
      <SEOHead
        title="Ajmal Akhtar Azad — Mayor of Bhokraha Narsingh"
        description="Official site of Mayor Ajmal Akhtar Azad. Together for development, dignity and democracy in Bhokraha Narsingh Municipality, Sunsari, Nepal."
        url="/"
        image={ogHome}
        imageAlt="Sunrise over the Himalayas — official site of Mayor Ajmal Akhtar Azad"
        keywords="Ajmal Akhtar Azad, Mayor, Bhokraha Narsingh, Sunsari, Nepal, Municipality, Development"
      />
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
