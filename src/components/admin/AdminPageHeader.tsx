import { motion } from "framer-motion";
import { Sparkles, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  gradient?: string;
  actions?: ReactNode;
}

const AdminPageHeader = ({
  title,
  description,
  icon: Icon = Sparkles,
  badge = "Admin",
  gradient = "from-primary via-primary to-accent",
  actions,
}: AdminPageHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl mb-5 sm:mb-6"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-95`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.25),_transparent_60%)]" />
      <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative p-5 sm:p-7 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-bold uppercase tracking-widest">
            <Icon className="h-3 w-3" />
            {badge}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-white/85 max-w-xl">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </motion.div>
  );
};

export default AdminPageHeader;
