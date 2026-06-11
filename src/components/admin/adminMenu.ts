import {
  LayoutDashboard, FileText, Users, BarChart3, Settings, Home, Eye, Grid3x3,
  Info, Image, Phone, PanelBottom, Mic, MessageCircle, Heart, Mail, Send,
  Newspaper, TrendingUp, FlaskConical, Trophy, Search,
} from "lucide-react";

export interface MenuItem { icon: React.ElementType; label: string; path: string; description?: string; }
export interface MenuSection { title: string; items: MenuItem[]; }

export const menuSections: MenuSection[] = [
  { title: "Dashboard", items: [
    { icon: LayoutDashboard, label: "Overview", path: "/admin", description: "Site-wide snapshot" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics", description: "Traffic & insights" },
    { icon: Search, label: "SEO & Search", path: "/admin/seo", description: "GSC + Semrush live" },
    { icon: TrendingUp, label: "Engagement", path: "/admin/engagement", description: "Reader interactions" },
  ]},
  { title: "Content", items: [
    { icon: FileText, label: "Posts", path: "/admin/posts", description: "Articles & news" },
    { icon: Mic, label: "Podcasts", path: "/admin/podcasts", description: "Audio & video shows" },
    { icon: Image, label: "Gallery", path: "/admin/gallery", description: "Photo library" },
  ]},
  { title: "Sports / KPL", items: [
    { icon: Trophy, label: "KPL3 Manager", path: "/admin/sports", description: "Tournament control" },
  ]},
  { title: "Engagement", items: [
    { icon: MessageCircle, label: "Comments", path: "/admin/comments", description: "Moderate discussion" },
    { icon: Heart, label: "Post Stats", path: "/admin/post-stats", description: "Likes & reach" },
    { icon: Mail, label: "Newsletter", path: "/admin/newsletter", description: "Subscriber list" },
    { icon: Send, label: "Email Marketing", path: "/admin/email-marketing", description: "Campaigns" },
    { icon: FlaskConical, label: "A/B Testing", path: "/admin/ab-testing", description: "Experiments" },
    { icon: Newspaper, label: "Email Builder", path: "/admin/email-builder", description: "Template designer" },
    { icon: Phone, label: "Contact Messages", path: "/admin/contact-messages", description: "Inbox" },
  ]},
  { title: "Page Sections", items: [
    { icon: Home, label: "Hero Section", path: "/admin/hero" },
    { icon: Eye, label: "Vision Section", path: "/admin/vision" },
    { icon: Grid3x3, label: "Development Areas", path: "/admin/development-areas" },
    { icon: Info, label: "About Page", path: "/admin/about" },
    { icon: Phone, label: "Contact Page", path: "/admin/contact" },
    { icon: PanelBottom, label: "Footer", path: "/admin/footer" },
  ]},
  { title: "Administration", items: [
    { icon: Users, label: "Users", path: "/admin/users", description: "Roles & accounts" },
    { icon: Mail, label: "Email Templates", path: "/admin/email-templates" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ]},
];

export const findCurrentMenuItem = (pathname: string): MenuItem | undefined => {
  for (const s of menuSections) {
    const exact = s.items.find(i => i.path === pathname);
    if (exact) return exact;
  }
  // partial fallback
  for (const s of menuSections) {
    const m = s.items.find(i => pathname.startsWith(i.path) && i.path !== "/admin");
    if (m) return m;
  }
  return menuSections[0].items[0];
};
