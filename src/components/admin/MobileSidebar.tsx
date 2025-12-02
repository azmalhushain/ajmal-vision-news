import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
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
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/admin" },
  { icon: FileText, label: "Posts", path: "/admin/posts" },
  { icon: Mic, label: "Podcasts", path: "/admin/podcasts" },
  { icon: MessageCircle, label: "Comments", path: "/admin/comments" },
  { icon: Heart, label: "Post Stats", path: "/admin/post-stats" },
  { icon: Home, label: "Hero Section", path: "/admin/hero" },
  { icon: Eye, label: "Vision Section", path: "/admin/vision" },
  { icon: Grid3x3, label: "Dev Areas", path: "/admin/development-areas" },
  { icon: Info, label: "About Page", path: "/admin/about" },
  { icon: Image, label: "Gallery", path: "/admin/gallery" },
  { icon: Phone, label: "Contact Page", path: "/admin/contact" },
  { icon: PanelBottom, label: "Footer", path: "/admin/footer" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
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
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Admin
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={onClose}>
                  <div
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
