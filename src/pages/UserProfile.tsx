import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, Phone, Mail, Save, LogOut, Camera, Loader2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
}

const UserProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    setEmail(session.user.email || "");
    fetchProfile(session.user.id);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
    } else if (error) {
      // Create profile if it doesn't exist
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({ id: userId })
        .select()
        .single();
      if (newProfile) setProfile(newProfile);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        bio: profile.bio,
        location: profile.location,
      })
      .eq("id", profile.id);

    if (error) {
      toast({ title: "Error updating profile", variant: "destructive" });
    } else {
      toast({ title: "Profile updated successfully!" });
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !profile) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `avatars/${profile.id}.${fileExt}`;

    setUploading(true);

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Error uploading avatar", variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
    
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", profile.id);

    if (updateError) {
      toast({ title: "Error updating avatar", variant: "destructive" });
    } else {
      setProfile({ ...profile, avatar_url: data.publicUrl });
      toast({ title: "Avatar updated!" });
    }
    setUploading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-12 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Profile Header Card */}
            <Card className="overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary to-accent" />
              <CardContent className="relative pt-0">
                <div className="flex flex-col items-center -mt-12">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {profile?.full_name?.charAt(0) || email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </label>
                  </div>
                  <h1 className="mt-4 text-2xl font-bold">
                    {profile?.full_name || "Your Profile"}
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Mail className="h-4 w-4" /> {email}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Edit Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile?.full_name || ""}
                    onChange={(e) =>
                      setProfile(profile ? { ...profile, full_name: e.target.value } : null)
                    }
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={profile?.phone || ""}
                      onChange={(e) =>
                        setProfile(profile ? { ...profile, phone: e.target.value } : null)
                      }
                      placeholder="+977 XXX-XXXXXXX"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={profile?.location || ""}
                      onChange={(e) =>
                        setProfile(profile ? { ...profile, location: e.target.value } : null)
                      }
                      placeholder="City, Country"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile?.bio || ""}
                    onChange={(e) =>
                      setProfile(profile ? { ...profile, bio: e.target.value } : null)
                    }
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default UserProfile;