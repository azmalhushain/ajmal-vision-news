import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-foreground">AJMAL AKHTAR AZAD</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Mayor of Bhokraha Narsingh Municipality, committed to transparent governance and inclusive development.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
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
                <span>Bhokraha Narsingh Municipality<br />Sunsari District, Nepal</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <span>+977-XXX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <span>info@bhokrahanarsingh.gov.np</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm text-center md:text-left">
              © {currentYear} Ajmal Akhtar Azad. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm text-center md:text-right">
              Developed with ❤️ for Bhokraha Narsingh
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
