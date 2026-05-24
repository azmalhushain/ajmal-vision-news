import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { Search, Moon, Sun, LogOut, User as UserIcon, Menu, Command as CommandIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminNotifications } from "./AdminNotifications";
import { AdminCommandPalette } from "./AdminCommandPalette";
import { findCurrentMenuItem } from "./adminMenu";

interface AdminNavbarProps {
  user: User;
  onLogout: () => void;
  onMenuClick?: () => void;
}

const AdminNavbar = ({ user, onLogout, onMenuClick }: AdminNavbarProps) => {
  const { pathname } = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("theme") === "dark";
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) { root.classList.add("dark"); localStorage.setItem("theme", "dark"); }
    else { root.classList.remove("dark"); localStorage.setItem("theme", "light"); }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(v => !v);
  const current = findCurrentMenuItem(pathname);

  return (
    <>
      <header className="sticky top-0 z-30 h-14 sm:h-16 border-b border-border/60 bg-gradient-to-r from-card/95 via-card/90 to-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70">
        <div className="flex h-full items-center gap-2 sm:gap-4 px-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-accent/60 rounded-full transition-colors"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumb / current section */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Admin</span>
            <ChevronRight className="hidden sm:inline h-3.5 w-3.5 text-muted-foreground/50" />
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.path}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 min-w-0"
              >
                {current?.icon && (
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                    <current.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-sm sm:text-base font-bold text-foreground truncate">{current?.label || "Admin"}</span>
                  {current?.description && (
                    <span className="hidden md:inline text-[10px] text-muted-foreground truncate">{current.description}</span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex-1" />

          {/* Command palette trigger */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-full bg-background/60 border border-border/60 hover:border-primary/40 hover:bg-background/80 transition-all text-sm text-muted-foreground min-w-[220px] group"
            aria-label="Open command palette"
          >
            <Search className="h-4 w-4 group-hover:text-primary transition-colors" />
            <span className="flex-1 text-left">Quick search…</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 font-mono text-[10px]">⌘K</kbd>
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPaletteOpen(true)}
            className="sm:hidden h-9 w-9 rounded-full hover:bg-accent/60"
            aria-label="Search"
          >
            <CommandIcon className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-accent/60 transition-all overflow-hidden"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDarkMode ? "sun" : "moon"}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.25 }}
                  className="inline-flex"
                >
                  {isDarkMode ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
                </motion.span>
              </AnimatePresence>
            </Button>

            <AdminNotifications />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-1.5 sm:px-2 rounded-full hover:bg-accent/60 transition-all">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 ring-2 ring-background"
                  >
                    <UserIcon className="h-4 w-4" />
                  </motion.div>
                  <span className="hidden md:inline-block text-sm font-medium truncate max-w-[140px]">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme}>
                  {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  {isDarkMode ? "Light mode" : "Dark mode"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <AdminCommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onToggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      />
    </>
  );
};

export default AdminNavbar;
