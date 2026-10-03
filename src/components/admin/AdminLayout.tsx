import { useState, useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import MobileSidebar from "./MobileSidebar";
import { useToast } from "@/hooks/use-toast";
import { canAccessAdminPath, filterMenuSections, menuSections } from "./adminMenu";

const AdminLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const visibleSections = useMemo(
    () => isAdmin ? menuSections : filterMenuSections(permissions),
    [isAdmin, permissions],
  );

  useEffect(() => {
    let active = true;
    const checkAccess = async (sessionUser: User | null) => {
      setLoading(true);
      setUser(sessionUser);
      setIsAdmin(false);
      setPermissions([]);
      if (!sessionUser) {
        if (active) {
          setLoading(false);
          navigate("/auth", { replace: true });
        }
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sessionUser.id)
        .maybeSingle();

      if (!active) return;
      if (roleError || !roleData) {
        setLoading(false);
        toast({
          title: "Access Denied",
          description: "Your account has no admin section access.",
          variant: "destructive",
        });
        navigate("/", { replace: true });
        return;
      }

      if (roleData.role === "admin") {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      const { data: grants, error: grantsError } = await supabase
        .from("user_section_permissions")
        .select("section")
        .eq("user_id", sessionUser.id);

      if (!active) return;
      if (grantsError) {
        setLoading(false);
        toast({ title: "Access could not be checked", variant: "destructive" });
        navigate("/", { replace: true });
        return;
      }
      const assigned = (grants || []).map((grant) => grant.section);
      setPermissions(assigned);
      setLoading(false);
      if (!canAccessAdminPath(location.pathname, assigned)) {
        const firstAllowed = filterMenuSections(assigned).flatMap((section) => section.items)[0];
        if (firstAllowed) navigate(firstAllowed.path, { replace: true });
        else navigate("/", { replace: true });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void checkAccess(session?.user ?? null);
    });

    void supabase.auth.getSession().then(({ data: { session } }) => checkAccess(session?.user ?? null));

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [location.pathname, navigate, toast]);

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

  if (!user || (!isAdmin && !permissions.length)) return null;

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Ambient animated backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute top-1/4 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl animate-pulse" style={{ animationDuration: "9s" }} />
        <div className="absolute bottom-1/4 -right-32 w-[32rem] h-[32rem] rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDuration: "11s" }} />
      </div>
      <AdminSidebar sections={visibleSections} />
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        sections={visibleSections}
      />
      <div className="lg:pl-64 relative min-w-0">
        <AdminNavbar
          user={user}
          onLogout={handleLogout}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          sections={visibleSections}
        />
        <main className="admin-scope p-3 sm:p-4 md:p-6 lg:p-8 animate-fade-in min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
