import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Search, Moon, Sun, LogOut, User as UserIcon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminNotifications } from "./AdminNotifications";

interface AdminNavbarProps {
  user: User;
  onLogout: () => void;
  onMenuClick?: () => void;
}

const AdminNavbar = ({ user, onLogout, onMenuClick }: AdminNavbarProps) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 border-b border-border/60 bg-gradient-to-r from-card/95 via-card/90 to-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-full items-center gap-2 sm:gap-4 px-3 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-accent/60 transition-colors"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1 flex items-center gap-2 sm:gap-4">
          <div className="relative w-full max-w-md hidden sm:block group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder="Search posts, users, settings…"
              className="pl-10 bg-background/60 border-border/60 focus-visible:ring-primary/40 focus-visible:border-primary/40 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-accent/60 transition-all hover:rotate-12"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>

          <AdminNotifications />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-1.5 sm:px-2 rounded-full hover:bg-accent/60 transition-all">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
                  <UserIcon className="h-4 w-4" />
                </div>
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
  );
};

export default AdminNavbar;
