import { useState, useEffect } from "react";
import { NewsCard } from "./NewsCard";
import { NewsModal } from "./NewsModal";
import { Button } from "@/components/ui/button";
import { Article } from "@/types/article";
import infrastructureImg from "@/assets/news-infrastructure.jpg";
import youthImg from "@/assets/news-youth.jpg";
import digitalImg from "@/assets/news-digital.jpg";
import healthcareImg from "@/assets/news-healthcare.jpg";
import environmentImg from "@/assets/news-environment.jpg";
import educationImg from "@/assets/news-education.jpg";
import womenImg from "@/assets/news-women.jpg";
import smartcityImg from "@/assets/news-smartcity.jpg";

const newsArticles: Article[] = [
  {
    id: 1,
    title: "New Infrastructure Development Project Launched",
    date: "March 15, 2025",
    summary: "A comprehensive infrastructure development initiative aimed at improving road networks and public facilities across the region.",
    image: infrastructureImg,
    fullContent: "A comprehensive infrastructure development initiative has been launched to transform the region's connectivity and public facilities. This ambitious project focuses on modernizing road networks, upgrading public transportation systems, and creating sustainable urban spaces. The initiative includes the construction of new highways, renovation of existing roads, and the development of smart traffic management systems. Community feedback has been integral to the planning process, ensuring that the project addresses the real needs of local residents. The project is expected to create thousands of jobs and significantly improve the quality of life for citizens.",
    category: "Development"
  },
  {
    id: 2,
    title: "Youth Empowerment Program Reaches 10,000 Students",
    date: "March 10, 2025",
    summary: "Celebrating a major milestone in our youth empowerment initiative with skill development workshops and mentorship programs.",
    image: youthImg,
    fullContent: "Our youth empowerment program has achieved a remarkable milestone by reaching over 10,000 students across the region. This comprehensive initiative combines skill development workshops, career mentorship, and entrepreneurship training to prepare young people for the challenges of tomorrow. The program offers courses in technology, leadership, communication, and vocational skills, all designed with input from industry experts. Success stories have been pouring in, with many participants securing employment or launching their own ventures. We're committed to expanding this program to reach even more young people and create pathways to success for the next generation.",
    category: "Education"
  },
  {
    id: 3,
    title: "Digital Literacy Campaign for Rural Communities",
    date: "March 5, 2025",
    summary: "Bridging the digital divide with free computer training and internet access centers in rural areas.",
    image: digitalImg,
    fullContent: "Our digital literacy campaign is making technology accessible to rural communities that have long been underserved. The initiative establishes community digital centers equipped with computers, high-speed internet, and trained instructors. Free courses cover everything from basic computer skills to advanced topics like digital marketing and online entrepreneurship. The program particularly focuses on empowering women and senior citizens, helping them navigate the digital world with confidence. Early results show increased economic opportunities, better access to government services, and improved educational outcomes for children whose parents can now support their online learning.",
    category: "Digital Reform"
  },
  {
    id: 4,
    title: "Healthcare Initiative: Free Medical Camps Across Districts",
    date: "February 28, 2025",
    summary: "Providing accessible healthcare services through mobile medical units and specialized treatment camps.",
    image: healthcareImg,
    fullContent: "A groundbreaking healthcare initiative is bringing quality medical services directly to underserved communities through mobile medical units and specialized treatment camps. These camps offer free consultations, diagnostic tests, medications, and preventive care services. Expert doctors and healthcare professionals volunteer their time to ensure every citizen has access to proper medical attention. The program has successfully conducted health screenings for thousands of people, identified chronic conditions early, and provided life-saving treatments. We're also establishing partnerships with hospitals to ensure follow-up care for patients who need ongoing treatment.",
    category: "Healthcare"
  },
  {
    id: 5,
    title: "Green Initiative: 100,000 Trees Planted This Year",
    date: "February 20, 2025",
    summary: "Leading environmental conservation efforts with massive tree plantation drives and awareness campaigns.",
    image: environmentImg,
    fullContent: "Our environmental conservation program has achieved a significant milestone with the planting of 100,000 trees across the region this year. This green initiative goes beyond just tree plantation – it includes community education about environmental stewardship, the creation of urban green spaces, and the implementation of sustainable practices. Local schools, businesses, and community organizations have enthusiastically participated in plantation drives. Each tree is tagged and monitored to ensure its growth and survival. The initiative also includes the establishment of community gardens, rooftop farming projects, and waste management programs that promote a circular economy.",
    category: "Environment"
  },
  {
    id: 6,
    title: "Education Reform: 50 Schools Upgraded with Modern Facilities",
    date: "February 15, 2025",
    summary: "Transforming educational infrastructure with smart classrooms, libraries, and sports facilities.",
    image: educationImg,
    fullContent: "A comprehensive education reform program has successfully upgraded 50 schools with modern facilities and learning resources. The transformation includes the installation of smart classrooms with digital whiteboards and projectors, well-stocked libraries with thousands of new books, computer labs with internet connectivity, and improved sports facilities. Teacher training programs ensure educators can effectively use these new resources. The reform also addresses basic infrastructure needs like proper sanitation, safe drinking water, and adequate lighting. Early assessment shows marked improvement in student engagement, attendance rates, and learning outcomes.",
    category: "Education"
  },
  {
    id: 7,
    title: "Women's Economic Empowerment Program Launched",
    date: "February 10, 2025",
    summary: "Supporting women entrepreneurs with microfinance, skill training, and market access opportunities.",
    image: womenImg,
    fullContent: "A dedicated women's economic empowerment program has been launched to support women entrepreneurs and create sustainable livelihood opportunities. The program provides access to microfinance loans with minimal interest rates, comprehensive business training, and mentorship from successful women entrepreneurs. We've established women's self-help groups that facilitate collective business ventures and provide mutual support. The initiative also connects women artisans and producers directly with markets, eliminating middlemen and ensuring fair prices. Success stories include women-led cooperatives in textiles, food processing, and handicrafts that are now generating substantial income and employment.",
    category: "Community"
  },
  {
    id: 8,
    title: "Smart City Initiative: Public WiFi and Digital Services",
    date: "February 5, 2025",
    summary: "Modernizing urban infrastructure with free public WiFi hotspots and integrated digital governance services.",
    image: smartcityImg,
    fullContent: "The smart city initiative is revolutionizing urban living by establishing free public WiFi hotspots across the city and integrating digital governance services. Citizens can now access government services, file applications, and track their status online without visiting offices. The initiative includes the deployment of smart street lighting, traffic management systems, and public safety cameras. Digital kiosks have been installed at key locations where trained staff assist citizens with digital services. The program also promotes cashless transactions and digital payments. This transformation is making the city more livable, efficient, and citizen-friendly, setting a benchmark for modern urban development.",
    category: "Development"
  }
];

export const NewsSection = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-b from-background via-background to-secondary py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 ${isVisible ? 'fade-in-up' : 'opacity-0'}`}>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-4 tracking-tight">
            Latest News & Updates
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay informed about our ongoing projects, initiatives, and community developments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {newsArticles.map((article, index) => (
            <div
              key={article.id}
              className={`${isVisible ? 'fade-in-up' : 'opacity-0'} animate-delay-${(index + 1) * 100}`}
            >
              <NewsCard
                article={article}
                onClick={() => setSelectedArticle(article)}
              />
            </div>
          ))}
        </div>

        <div className={`text-center ${isVisible ? 'fade-in-up animate-delay-600' : 'opacity-0'}`}>
          <Button
            variant="outline"
            size="lg"
            className="glass-card glass-hover text-foreground font-semibold px-8 py-6 text-lg border-2"
          >
            View All News
          </Button>
        </div>
      </div>

      <NewsModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </section>
  );
};
