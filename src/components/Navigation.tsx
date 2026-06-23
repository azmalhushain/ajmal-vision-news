import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Globe, Search, User, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, LANGUAGE_META, type Language } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/GlobalSearch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSiteFeature } from "@/hooks/useSiteFeature";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { enabled: sportsEnabled } = useSiteFeature("sports", true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
        checkAdminRole(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
        checkAdminRole(session.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (data) setProfile(data);
  };

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navLinks = [
    { name: t("home"), path: "/" },
    { name: t("about"), path: "/about" },
    { name: t("vision"), path: "/vision" },
    { name: t("news"), path: "/news" },
    { name: t("podcasts"), path: "/podcasts" },
    ...(sportsEnabled ? [{ name: "Sports", path: "/sports" }] : []),
    { name: t("gallery"), path: "/gallery" },
    { name: t("contact"), path: "/contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled ? "glass-card py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-2xl font-black tracking-wider text-foreground transition-all group-hover:text-accent">
              AJMAL AKHTAR AZAD
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            <ul className="flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      "relative text-sm font-semibold uppercase tracking-wider transition-colors hover:text-accent",
                      location.pathname === link.path
                        ? "text-accent"
                        : "text-foreground"
                    )}
                  >
                    {link.name}
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300",
                        location.pathname === link.path ? "w-full" : "w-0 group-hover:w-full"
                      )}
                    />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="hover:bg-accent/10"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="uppercase text-xs font-semibold">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
                {(Object.keys(LANGUAGE_META) as Language[]).map((code) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => setLanguage(code)}
                    className={language === code ? "bg-accent/10" : ""}
                  >
                    <span className="mr-2">{LANGUAGE_META[code].flag}</span>
                    {LANGUAGE_META[code].native}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu or Login */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 text-accent">
                          <Shield className="h-4 w-4" /> Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/auth">{t("login")}</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="h-9 w-9"
            >
              <Search className="h-5 w-5" />
            </Button>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 px-2">
                  <Globe className="h-4 w-4" />
                  <span className="uppercase text-xs">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
                {(Object.keys(LANGUAGE_META) as Language[]).map((code) => (
                  <DropdownMenuItem key={code} onClick={() => setLanguage(code)}>
                    <span className="mr-2">{LANGUAGE_META[code].flag}</span>
                    {LANGUAGE_META[code].native}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile user menu / login — always visible */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 text-accent">
                          <Shield className="h-4 w-4" /> Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm" className="h-9 px-3 text-xs font-semibold">
                <Link to="/auth">{t("login")}</Link>
              </Button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground hover:text-accent transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            isOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
          )}
        >
          <ul className="flex flex-col gap-4 glass-card p-6 rounded-2xl">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={cn(
                    "block text-base font-semibold uppercase tracking-wider transition-colors hover:text-accent",
                    location.pathname === link.path
                      ? "text-accent"
                      : "text-foreground"
                  )}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            {user ? (
              <>
                <li>
                  <Link
                    to="/profile"
                    className="block text-base font-semibold uppercase tracking-wider transition-colors hover:text-accent text-foreground"
                  >
                    My Profile
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 text-base font-semibold uppercase tracking-wider transition-colors hover:text-accent text-accent"
                    >
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={handleLogout}
                    className="block text-base font-semibold uppercase tracking-wider transition-colors text-destructive hover:text-destructive/80"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/auth"
                  className="block text-base font-semibold uppercase tracking-wider transition-colors hover:text-accent text-accent"
                >
                  {t("login")}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
};
