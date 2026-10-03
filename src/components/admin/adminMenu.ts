import {
  LayoutDashboard, FileText, Users, BarChart3, Settings, Home, Eye, Grid3x3,
  Info, Image, Phone, PanelBottom, Mic, MessageCircle, Heart, Mail, Send,
  Newspaper, TrendingUp, FlaskConical, Trophy, Search, CalendarDays,
} from "lucide-react";

export interface MenuItem { icon: React.ElementType; label: string; path: string; description?: string; permissionKey?: string; }
export interface MenuSection { title: string; items: MenuItem[]; }

export const menuSections: MenuSection[] = [
  { title: "Dashboard", items: [
    { icon: LayoutDashboard, label: "Overview", path: "/admin", description: "Site-wide snapshot" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics", description: "Traffic & insights" },
    { icon: Search, label: "SEO & Search", path: "/admin/seo", description: "GSC + Semrush live" },
    { icon: TrendingUp, label: "Engagement", path: "/admin/engagement", description: "Reader interactions" },
  ]},
  { title: "Content", items: [
    { icon: CalendarDays, label: "Calendar", path: "/admin/calendar", description: "Plan & schedule" },
    { icon: FileText, label: "Posts", path: "/admin/posts", description: "Articles & news", permissionKey: "posts" },
    { icon: Mic, label: "Podcasts", path: "/admin/podcasts", description: "Audio & video shows", permissionKey: "podcasts" },
    { icon: Image, label: "Gallery", path: "/admin/gallery", description: "Photo library", permissionKey: "gallery" },
  ]},
  { title: "Sports / KPL", items: [
    { icon: Trophy, label: "KPL3 Manager", path: "/admin/sports", description: "Tournament control", permissionKey: "sports" },
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
    { icon: Home, label: "Hero Section", path: "/admin/hero", permissionKey: "hero" },
    { icon: Eye, label: "Vision Section", path: "/admin/vision", permissionKey: "vision" },
    { icon: Grid3x3, label: "Development Areas", path: "/admin/development-areas", permissionKey: "development-areas" },
    { icon: Info, label: "About Page", path: "/admin/about", permissionKey: "about" },
    { icon: Phone, label: "Contact Page", path: "/admin/contact", permissionKey: "contact" },
    { icon: PanelBottom, label: "Footer", path: "/admin/footer", permissionKey: "footer" },
  ]},
  { title: "Administration", items: [
    { icon: Users, label: "Users", path: "/admin/users", description: "Roles & accounts" },
    { icon: Mail, label: "Email Templates", path: "/admin/email-templates" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ]},
];

export const assignableSections = [
  { key: "posts", label: "Posts & news" },
  { key: "podcasts", label: "Podcasts" },
  { key: "gallery", label: "Gallery" },
  { key: "sports", label: "Sports / KPL" },
  { key: "hero", label: "Hero section" },
  { key: "vision", label: "Vision section" },
  { key: "development-areas", label: "Development areas" },
  { key: "about", label: "About page" },
  { key: "contact", label: "Contact page" },
  { key: "footer", label: "Footer" },
] as const;

const contentPermissions = ["posts", "podcasts", "gallery"];

export const getSectionPermissionForPath = (pathname: string): string | undefined => {
  if (pathname === "/admin/calendar") return "content-calendar";
  return menuSections.flatMap((section) => section.items)
    .find((item) => item.path === pathname)?.permissionKey;
};

export const canAccessAdminPath = (pathname: string, permissions: string[]): boolean => {
  if (pathname === "/admin") return false;
  const key = getSectionPermissionForPath(pathname);
  if (key === "content-calendar") return contentPermissions.some((permission) => permissions.includes(permission));
  return Boolean(key && permissions.includes(key));
};

export const filterMenuSections = (permissions: string[]): MenuSection[] => {
  const hasContentAccess = contentPermissions.some((permission) => permissions.includes(permission));
  return menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.path === "/admin/calendar") return hasContentAccess;
        return Boolean(item.permissionKey && permissions.includes(item.permissionKey));
      }),
    }))
    .filter((section) => section.items.length > 0);
};

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
