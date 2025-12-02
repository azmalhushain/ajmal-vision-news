import { useState, useEffect } from "react";
import { Heart, MessageCircle, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShareButtons } from "@/components/ShareButtons";
import { useLanguage } from "@/contexts/LanguageContext";

interface PostEngagementProps {
  postId: string;
  initialViews?: number;
  initialLikes?: number;
  title: string;
  summary: string;
  image?: string;
  variant?: "compact" | "full";
  showComments?: boolean;
}

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export const PostEngagement = ({
  postId,
  initialViews = 0,
  initialLikes = 0,
  title,
  summary,
  image,
  variant = "compact",
  showComments = false,
}: PostEngagementProps) => {
  const [likes, setLikes] = useState(initialLikes);
  const [views] = useState(initialViews);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Generate or get session ID for anonymous likes
  const getSessionId = () => {
    let sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("session_id", sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    checkIfLiked();
    fetchCommentsCount();
    if (showComments) {
      fetchComments();
    }
  }, [postId, showComments]);

  const checkIfLiked = async () => {
    const sessionId = getSessionId();
    const { data: session } = await supabase.auth.getSession();
    
    let query = supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId);
    
    if (session?.session?.user) {
      query = query.eq("user_id", session.session.user.id);
    } else {
      query = query.eq("session_id", sessionId);
    }
    
    const { data } = await query.maybeSingle();
    setIsLiked(!!data);
  };

  const fetchCommentsCount = async () => {
    const { count } = await supabase
      .from("post_comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .eq("is_approved", true)
      .eq("is_visible", true);
    
    setCommentsCount(count || 0);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .eq("is_approved", true)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(10);
    
    if (data) {
      setComments(data);
    }
  };

  const handleLike = async () => {
    const sessionId = getSessionId();
    const { data: session } = await supabase.auth.getSession();
    
    if (isLiked) {
      // Unlike
      let query = supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId);
      
      if (session?.session?.user) {
        query = query.eq("user_id", session.session.user.id);
      } else {
        query = query.eq("session_id", sessionId);
      }
      
      const { error } = await query;
      if (!error) {
        setLikes((prev) => Math.max(0, prev - 1));
        setIsLiked(false);
      }
    } else {
      // Like
      const likeData: { post_id: string; user_id?: string; session_id?: string } = {
        post_id: postId,
      };
      
      if (session?.session?.user) {
        likeData.user_id = session.session.user.id;
      } else {
        likeData.session_id = sessionId;
      }
      
      const { error } = await supabase.from("post_likes").insert(likeData);
      if (!error) {
        setLikes((prev) => prev + 1);
        setIsLiked(true);
      }
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !authorName.trim()) {
      toast({ title: t("fillAllFields"), variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    const { data: session } = await supabase.auth.getSession();
    
    const { error } = await supabase.from("post_comments").insert({
      post_id: postId,
      author_name: authorName.trim(),
      content: newComment.trim(),
      user_id: session?.session?.user?.id || null,
    });
    
    if (error) {
      toast({ title: t("commentError"), variant: "destructive" });
    } else {
      toast({ title: t("commentSubmitted") });
      setNewComment("");
      setShowCommentForm(false);
      
      // Send email notification to admin
      try {
        await supabase.functions.invoke("notify-comment", {
          body: {
            post_id: postId,
            post_title: title,
            author_name: authorName.trim(),
            content: newComment.trim(),
          },
        });
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
      }
    }
    setIsSubmitting(false);
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-4 text-muted-foreground text-sm">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors hover:text-red-500 ${
            isLiked ? "text-red-500" : ""
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
          <span>{likes}</span>
        </button>
        <button
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="flex items-center gap-1.5 transition-colors hover:text-accent"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{commentsCount}</span>
        </button>
        <div className="flex items-center gap-1.5">
          <Eye className="w-4 h-4" />
          <span>{views}</span>
        </div>
        <ShareButtons
          url={`/news/${postId}`}
          title={title}
          description={summary}
          image={image}
          variant="dropdown"
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Engagement Stats */}
      <div className="flex items-center gap-6 py-4 border-y border-border">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-all hover:scale-105 ${
            isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          <span className="font-medium">{likes} {t("likes")}</span>
        </button>
        <button
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="flex items-center gap-2 text-muted-foreground transition-all hover:scale-105 hover:text-accent"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">{commentsCount} {t("comments")}</span>
        </button>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Eye className="w-5 h-5" />
          <span className="font-medium">{views} {t("views")}</span>
        </div>
        <div className="ml-auto">
          <ShareButtons
            url={`/news/${postId}`}
            title={title}
            description={summary}
            image={image}
            variant="inline"
            size="md"
          />
        </div>
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <div className="glass-card p-4 rounded-xl space-y-3">
          <h4 className="font-semibold text-foreground">{t("leaveComment")}</h4>
          <Input
            placeholder={t("yourName")}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="bg-background/50"
          />
          <Textarea
            placeholder={t("writeComment")}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-background/50 min-h-[100px]"
          />
          <div className="flex gap-2">
            <Button onClick={handleSubmitComment} disabled={isSubmitting}>
              {isSubmitting ? t("submitting") : t("submitComment")}
            </Button>
            <Button variant="outline" onClick={() => setShowCommentForm(false)}>
              {t("cancel")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("commentModeration")}</p>
        </div>
      )}

      {/* Comments List */}
      {showComments && comments.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">{t("comments")} ({comments.length})</h4>
          {comments.map((comment) => (
            <div key={comment.id} className="glass-card p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">{comment.author_name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-muted-foreground">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
