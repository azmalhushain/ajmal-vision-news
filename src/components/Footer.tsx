import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FooterContent {
  site_name: string;
  site_description: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  youtube_url: string;
  address: string;
  phone: string;
  email: string;
  copyright_text: string;
  tagline: string;
}

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [content, setContent] = useState<FooterContent>({
    site_name: "AJMAL AKHTAR AZAD",
    site_description: "Mayor of Bhokraha Narsingh Municipality, committed to transparent governance and inclusive development.",
    facebook_url: "#",
    twitter_url: "#",
    instagram_url: "#",
    youtube_url: "#",
    address: "Bhokraha Narsingh Municipality\nSunsari District, Nepal",
    phone: "+977-XXX-XXXXXX",
    email: "info@bhokrahanarsingh.gov.np",
    copyright_text: "Ajmal Akhtar Azad. All rights reserved.",
    tagline: "Developed with ❤️ for Bhokraha Narsingh",
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("footer_content")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      setContent({
        site_name: data.site_name,
        site_description: data.site_description,
        facebook_url: data.facebook_url || "#",
        twitter_url: data.twitter_url || "#",
        instagram_url: data.instagram_url || "#",
        youtube_url: data.youtube_url || "#",
        address: data.address,
        phone: data.phone,
        email: data.email,
        copyright_text: data.copyright_text,
        tagline: data.tagline,
      });
    }
  };

  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-foreground">{content.site_name}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {content.site_description}
            </p>
            <div className="flex gap-4">
              <a
                href={content.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={content.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href={content.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={content.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-accent transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-accent transition-colors text-sm"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/vision"
                  className="text-muted-foreground hover:text-accent transition-colors text-sm"
                >
                  Vision & Work
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="text-muted-foreground hover:text-accent transition-colors text-sm"
                >
                  News
                </Link>
              </li>
            </ul>
          </div>

          {/* More Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">More</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/gallery"
                  className="text-muted-foreground hover:text-accent transition-colors text-sm"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-accent transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-accent transition-colors text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-accent transition-colors text-sm"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{content.address}</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <span>{content.phone}</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <span>{content.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm text-center md:text-left">
              © {currentYear} {content.copyright_text}
            </p>
            <p className="text-muted-foreground text-sm text-center md:text-right">
              {content.tagline}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
