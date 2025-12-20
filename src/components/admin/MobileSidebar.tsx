import { Link, useLocation } from "react-router-dom";
import { X, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      { icon: Phone, label: "Messages", path: "/admin/contact-messages" },
    ],
  },
  {
    title: "Page Sections",
    items: [
      { icon: Home, label: "Hero", path: "/admin/hero" },
      { icon: Eye, label: "Vision", path: "/admin/vision" },
      { icon: Grid3x3, label: "Dev Areas", path: "/admin/development-areas" },
      { icon: Info, label: "About", path: "/admin/about" },
      { icon: Phone, label: "Contact", path: "/admin/contact" },
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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-card lg:hidden overflow-y-auto animate-in slide-in-from-left duration-300">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <Link to="/admin" className="flex items-center gap-2" onClick={onClose}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Newspaper className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Admin
              </span>
            </Link>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 p-3 overflow-y-auto space-y-4">
            {menuSections.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link key={item.path} to={item.path} onClick={onClose}>
                        <div
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                          }`}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate font-medium">{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
