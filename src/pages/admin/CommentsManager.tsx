import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Trash2, Eye, EyeOff, MessageCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  is_approved: boolean;
  is_visible: boolean;
  created_at: string;
  posts?: { title: string };
}

const CommentsManager = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const fetchComments = async () => {
    setLoading(true);
    let query = supabase
      .from("post_comments")
      .select("*, posts(title)")
      .order("created_at", { ascending: false });

    if (filter === "pending") {
      query = query.eq("is_approved", false);
    } else if (filter === "approved") {
      query = query.eq("is_approved", true);
    }

    const { data, error } = await query;
    if (error) {
      toast({ title: "Error fetching comments", variant: "destructive" });
    } else {
      setComments(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string, approve: boolean) => {
    const { error } = await supabase
      .from("post_comments")
      .update({ is_approved: approve })
      .eq("id", id);

    if (error) {
      toast({ title: "Error updating comment", variant: "destructive" });
    } else {
      toast({ title: approve ? "Comment approved" : "Comment unapproved" });
      fetchComments();
    }
  };

  const handleToggleVisibility = async (id: string, visible: boolean) => {
    const { error } = await supabase
      .from("post_comments")
      .update({ is_visible: visible })
      .eq("id", id);

    if (error) {
      toast({ title: "Error updating comment", variant: "destructive" });
    } else {
      toast({ title: visible ? "Comment visible" : "Comment hidden" });
      fetchComments();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast({ title: "Error deleting comment", variant: "destructive" });
    } else {
      toast({ title: "Comment deleted" });
      fetchComments();
    }
    setDeleteId(null);
  };

  const pendingCount = comments.filter((c) => !c.is_approved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comments Manager</h1>
          <p className="text-muted-foreground">
            Review, approve, and manage user comments
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-lg px-4 py-2">
            {pendingCount} Pending
          </Badge>
        )}
      </div>

      <Card className="glass-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            All Comments
          </CardTitle>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Comments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell className="font-medium">
                      {comment.author_name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {comment.content}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {comment.posts?.title || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge
                          variant={comment.is_approved ? "default" : "secondary"}
                        >
                          {comment.is_approved ? "Approved" : "Pending"}
                        </Badge>
                        {!comment.is_visible && (
                          <Badge variant="outline">Hidden</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!comment.is_approved ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-green-500 hover:text-green-600"
                            onClick={() => handleApprove(comment.id, true)}
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-orange-500 hover:text-orange-600"
                            onClick={() => handleApprove(comment.id, false)}
                            title="Unapprove"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() =>
                            handleToggleVisibility(comment.id, !comment.is_visible)
                          }
                          title={comment.is_visible ? "Hide" : "Show"}
                        >
                          {comment.is_visible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(comment.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommentsManager;
