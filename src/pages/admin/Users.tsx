import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Plus, Trash2, Calendar, Clock, Shield, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  role: string;
  is_active: boolean;
}

const Users = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "user" as "admin" | "moderator" | "user",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({ title: "Please log in", variant: "destructive" });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("get-users", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error fetching users:", error);
        // Fallback to profiles if edge function fails
        await fetchUsersFromProfiles();
        return;
      }

      if (data?.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error:", error);
      await fetchUsersFromProfiles();
    }
    setLoading(false);
  };

  const fetchUsersFromProfiles = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");

    const usersWithRoles = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.id)
          .single();

        return {
          id: profile.id,
          email: "",
          full_name: profile.full_name || "No name",
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          last_sign_in_at: null,
          email_confirmed_at: null,
          role: roles?.role || "user",
          is_active: true,
        };
      })
    );

    setUsers(usersWithRoles);
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    setCreating(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
      options: {
        data: {
          full_name: newUser.full_name,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (authError) {
      toast({ title: authError.message, variant: "destructive" });
      setCreating(false);
      return;
    }

    if (authData.user) {
      if (newUser.role !== "user") {
        const { error: roleError } = await supabase
          .from("user_roles")
          .update({ role: newUser.role })
          .eq("user_id", authData.user.id);

        if (roleError) {
          console.error("Error updating role:", roleError);
        }
      }

      toast({ title: "User created successfully!" });
      setNewUser({ email: "", password: "", full_name: "", role: "user" });
      setIsDialogOpen(false);
      fetchUsers();
    }

    setCreating(false);
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "moderator" | "user") => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error updating role", variant: "destructive" });
    } else {
      toast({ title: "Role updated successfully!" });
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error removing user", variant: "destructive" });
    } else {
      toast({ title: "User role removed!" });
      fetchUsers();
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "moderator":
        return "default";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Users Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage users, view details, and assign roles
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={newUser.full_name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, full_name: e.target.value })
                    }
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      placeholder="Enter password (min 6 characters)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value as "admin" | "moderator" | "user",
                      })
                    }
                    className="w-full h-10 px-3 border rounded-md bg-background"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button
                  onClick={handleCreateUser}
                  disabled={creating}
                  className="w-full"
                >
                  {creating ? "Creating..." : "Create User"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email || "Email hidden"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs">Role</span>
                  </div>
                  <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                    {selectedUser.role.toUpperCase()}
                  </Badge>
                </div>

                <div className="glass-card p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    {selectedUser.is_active ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-xs">Status</span>
                  </div>
                  <Badge variant={selectedUser.is_active ? "default" : "destructive"}>
                    {selectedUser.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="glass-card p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">Created</span>
                  </div>
                  <p className="text-sm font-medium">{formatDate(selectedUser.created_at)}</p>
                </div>

                <div className="glass-card p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">Last Sign In</span>
                  </div>
                  <p className="text-sm font-medium">{formatDate(selectedUser.last_sign_in_at)}</p>
                </div>

                <div className="glass-card p-4 rounded-lg col-span-2">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-xs">Email Verified</span>
                  </div>
                  <p className="text-sm font-medium">
                    {selectedUser.email_confirmed_at ? formatDate(selectedUser.email_confirmed_at) : "Not verified"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Note: Passwords are encrypted and cannot be viewed for security reasons.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {user.email || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as "admin" | "moderator" | "user")}
                        className="h-8 px-2 border rounded-md bg-background text-sm"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "destructive"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedUser(user)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Remove User"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Users;
