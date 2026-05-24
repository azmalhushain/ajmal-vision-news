import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Sparkles } from "lucide-react";
import { menuSections } from "./adminMenu";

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 hidden lg:block overflow-hidden border-r border-border/60 bg-gradient-to-b from-card via-card to-card/80 backdrop-blur-xl">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-32 -left-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
      <div className="pointer-events-none absolute bottom-0 -right-20 w-56 h-56 rounded-full bg-accent/20 blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />

      <div className="relative flex h-full flex-col">
        {/* Brand */}
        <div className="flex h-16 items-center border-b border-border/60 px-6">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
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
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-5 overflow-y-auto scrollbar-thin">
          {menuSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.05 }}
            >
              <h3 className="px-3 mb-2 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.2em]">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path}>
                      <motion.div
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="admin-active-pill"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-md shadow-primary/30"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <item.icon className={`relative h-4 w-4 shrink-0 ${isActive ? "" : "text-muted-foreground/80"}`} />
                        <span className="relative truncate">{item.label}</span>
                        {isActive && (
                          <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border/60 space-y-2">
          <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Quick search</span>
            <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/60 font-mono text-[10px]">⌘K</kbd>
          </div>
          <Link to="/" target="_blank">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 hover:from-primary/20 hover:via-accent/20 hover:to-primary/20 transition-all text-sm font-semibold"
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
