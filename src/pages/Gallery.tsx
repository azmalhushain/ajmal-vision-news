import { useEffect, useState } from "react";
import img1 from "@/assets/news-infrastructure.jpg";
import img2 from "@/assets/news-youth.jpg";
import img3 from "@/assets/news-digital.jpg";
import img4 from "@/assets/news-healthcare.jpg";
import img5 from "@/assets/news-environment.jpg";
import img6 from "@/assets/news-education.jpg";
import img7 from "@/assets/news-women.jpg";
import img8 from "@/assets/news-smartcity.jpg";
import { Footer } from "@/components/Footer";

const Gallery = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  const galleryImages = [
    { src: img1, title: "Infrastructure Development", category: "Development" },
    { src: img2, title: "Youth Empowerment Program", category: "Community" },
    { src: img3, title: "Digital Literacy Initiative", category: "Education" },
    { src: img4, title: "Healthcare Services", category: "Health" },
    { src: img5, title: "Environmental Programs", category: "Environment" },
    { src: img6, title: "Education Facilities", category: "Education" },
    { src: img7, title: "Women Empowerment", category: "Community" },
    { src: img8, title: "Smart City Projects", category: "Development" },
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
              <span className="block text-foreground">PROJECT</span>
              <span className="block text-accent">GALLERY</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A visual journey through our development initiatives and community programs.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer fade-in-up animate-delay-${
                  (index + 1) * 100
                }`}
                onClick={() => setSelectedImage(image.src)}
              >
                <div className="aspect-[4/3] relative">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="inline-block glass-card px-3 py-1 text-xs font-bold text-accent rounded-full mb-3">
                        {image.category}
                      </span>
                      <h3 className="text-xl font-bold text-foreground">{image.title}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-6xl w-full">
            <img
              src={selectedImage}
              alt="Gallery"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Gallery;
