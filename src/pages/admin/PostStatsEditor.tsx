import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Eye, Heart, Save } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Post {
  id: string;
  title: string;
  views: number;
  likes_count: number;
  created_at: string;
}

const PostStatsEditor = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [views, setViews] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, views, likes_count, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching posts", variant: "destructive" });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setViews(post.views || 0);
    setLikesCount(post.likes_count || 0);
  };

  const handleSave = async () => {
    if (!editingPost) return;

    const { error } = await supabase
      .from("posts")
      .update({ views, likes_count: likesCount })
      .eq("id", editingPost.id);

    if (error) {
      toast({ title: "Error updating stats", variant: "destructive" });
    } else {
      toast({ title: "Stats updated successfully" });
      fetchPosts();
      setEditingPost(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Post Statistics</h1>
        <p className="text-muted-foreground">
          View and manually adjust post views and likes count
        </p>
      </div>

      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Post Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No posts found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="h-4 w-4" /> Views
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Heart className="h-4 w-4" /> Likes
                    </div>
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {post.title}
                    </TableCell>
                    <TableCell className="text-center">{post.views || 0}</TableCell>
                    <TableCell className="text-center">
                      {post.likes_count || 0}
                    </TableCell>
                    <TableCell>
                      {new Date(post.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        Edit Stats
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Edit Post Stats</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-medium">
              {editingPost?.title}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="views" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Views Count
                </Label>
                <Input
                  id="views"
                  type="number"
                  min="0"
                  value={views}
                  onChange={(e) => setViews(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="likes" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Likes Count
                </Label>
                <Input
                  id="likes"
                  type="number"
                  min="0"
                  value={likesCount}
                  onChange={(e) => setLikesCount(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostStatsEditor;
