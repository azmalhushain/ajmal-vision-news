import { Link, useLocation } from "react-router-dom";
import { X, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { menuSections } from "./adminMenu";
import { useEffect } from "react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const location = useLocation();

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-md lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed left-0 top-0 z-50 h-screen w-[85vw] max-w-xs overflow-hidden border-r border-border/60 bg-gradient-to-b from-card via-card to-card/90 backdrop-blur-xl lg:hidden"
          >
            <div className="pointer-events-none absolute -top-24 -left-16 w-56 h-56 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 -right-16 w-56 h-56 rounded-full bg-accent/20 blur-3xl" />

            <div className="relative flex h-full flex-col">
              {/* Brand */}
              <div className="flex h-16 items-center justify-between border-b border-border/60 px-4">
                <Link to="/admin" className="flex items-center gap-2.5" onClick={onClose}>
                  <motion.div
                    whileTap={{ scale: 0.9, rotate: 10 }}
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30"
                  >
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </motion.div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-base font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Admin Panel
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Control Centre</span>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu" className="rounded-full hover:bg-accent/60">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Nav */}
              <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin space-y-5">
                {menuSections.map((section, sectionIndex) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + sectionIndex * 0.04 }}
                  >
                    <h3 className="px-3 mb-2 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.2em]">
                      {section.title}
                    </h3>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link key={item.path} to={item.path} onClick={onClose}>
                            <motion.div
                              whileTap={{ scale: 0.97 }}
                              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                                isActive
                                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/30"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                              }`}
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{item.label}</span>
                              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />}
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </nav>

              {/* Footer */}
              <div className="p-3 border-t border-border/60">
                <Link to="/" target="_blank" onClick={onClose}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 text-sm font-semibold"
                  >
                    <Eye className="h-4 w-4 text-primary" />
                    <span>View Live Site</span>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
