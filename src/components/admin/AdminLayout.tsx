import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import MobileSidebar from "./MobileSidebar";
import { useToast } from "@/hooks/use-toast";

const AdminLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async (userId: string) => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .single();

      if (error || !data) {
        setIsAdmin(false);
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this area.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      setIsAdmin(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Ambient animated backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute top-1/4 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl animate-pulse" style={{ animationDuration: "9s" }} />
        <div className="absolute bottom-1/4 -right-32 w-[32rem] h-[32rem] rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDuration: "11s" }} />
      </div>
      <AdminSidebar />
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="lg:pl-64 relative min-w-0">
        <AdminNavbar
          user={user}
          onLogout={handleLogout}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        <main className="p-3 sm:p-4 md:p-6 lg:p-8 animate-fade-in min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
