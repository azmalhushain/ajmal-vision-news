import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  Home,
  Eye,
  Grid3x3,
  Info,
  Image,
  Phone,
  PanelBottom,
  Mic,
  MessageCircle,
  Heart,
  Mail,
  Send,
  Newspaper,
  TrendingUp,
} from "lucide-react";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "Dashboard",
    items: [
      { icon: LayoutDashboard, label: "Overview", path: "/admin" },
      { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
      { icon: TrendingUp, label: "Engagement", path: "/admin/engagement" },
    ],
  },
  {
    title: "Content",
    items: [
      { icon: FileText, label: "Posts", path: "/admin/posts" },
      { icon: Mic, label: "Podcasts", path: "/admin/podcasts" },
      { icon: Image, label: "Gallery", path: "/admin/gallery" },
    ],
  },
  {
    title: "Engagement",
    items: [
      { icon: MessageCircle, label: "Comments", path: "/admin/comments" },
      { icon: Heart, label: "Post Stats", path: "/admin/post-stats" },
      { icon: Mail, label: "Newsletter", path: "/admin/newsletter" },
      { icon: Send, label: "Email Marketing", path: "/admin/email-marketing" },
      { icon: Newspaper, label: "Email Builder", path: "/admin/email-builder" },
      { icon: Phone, label: "Contact Messages", path: "/admin/contact-messages" },
    ],
  },
  {
    title: "Page Sections",
    items: [
      { icon: Home, label: "Hero Section", path: "/admin/hero" },
      { icon: Eye, label: "Vision Section", path: "/admin/vision" },
      { icon: Grid3x3, label: "Development Areas", path: "/admin/development-areas" },
      { icon: Info, label: "About Page", path: "/admin/about" },
      { icon: Phone, label: "Contact Page", path: "/admin/contact" },
      { icon: PanelBottom, label: "Footer", path: "/admin/footer" },
    ],
  },
  {
    title: "Administration",
    items: [
      { icon: Users, label: "Users", path: "/admin/users" },
      { icon: Mail, label: "Email Templates", path: "/admin/email-templates" },
      { icon: Settings, label: "Settings", path: "/admin/settings" },
    ],
  },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card hidden lg:block overflow-y-auto">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Newspaper className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Admin Panel
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-6">
          {menuSections.map((section, sectionIndex) => (
            <div key={section.title}>
              <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  const globalIndex = sectionIndex * 10 + index;
                  return (
                    <Link key={item.path} to={item.path}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: globalIndex * 0.03 }}
                        className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all text-sm ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Quick Access Footer */}
        <div className="p-4 border-t border-border">
          <Link to="/" target="_blank">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 bg-gradient-to-r from-primary/10 to-accent/10 text-foreground text-sm font-medium hover:from-primary/20 hover:to-accent/20 transition-all"
            >
              <Eye className="h-4 w-4 text-primary" />
              <span>View Live Site</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
