import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Bell, MessageCircle, Mail, Phone, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  type: "comment" | "subscriber" | "contact";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to real-time comments
    const commentsChannel = supabase
      .channel("admin-comments-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "post_comments" },
        (payload) => {
          const newComment = payload.new as { author_name: string; content: string; id: string };
          const notification: Notification = {
            id: `comment-${newComment.id}`,
            type: "comment",
            title: "New Comment",
            message: `${newComment.author_name}: "${newComment.content.slice(0, 50)}${newComment.content.length > 50 ? "..." : ""}"`,
            timestamp: new Date(),
            read: false,
          };
          setNotifications((prev) => [notification, ...prev.slice(0, 19)]);
          
          toast({
            title: "New Comment",
            description: `${newComment.author_name} commented on a post`,
          });
        }
      )
      .subscribe();

    // Subscribe to real-time newsletter subscribers
    const subscribersChannel = supabase
      .channel("admin-subscribers-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "newsletter_subscribers" },
        (payload) => {
          const newSub = payload.new as { email: string; id: string };
          const notification: Notification = {
            id: `sub-${newSub.id}`,
            type: "subscriber",
            title: "New Subscriber",
            message: `${newSub.email} subscribed to the newsletter`,
            timestamp: new Date(),
            read: false,
          };
          setNotifications((prev) => [notification, ...prev.slice(0, 19)]);
          
          toast({
            title: "New Subscriber",
            description: newSub.email,
          });
        }
      )
      .subscribe();

    // Subscribe to real-time contact messages
    const contactChannel = supabase
      .channel("admin-contact-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contact_messages" },
        (payload) => {
          const newMsg = payload.new as { name: string; subject: string | null; id: string };
          const notification: Notification = {
            id: `contact-${newMsg.id}`,
            type: "contact",
            title: "New Contact Message",
            message: `${newMsg.name}: ${newMsg.subject || "No subject"}`,
            timestamp: new Date(),
            read: false,
          };
          setNotifications((prev) => [notification, ...prev.slice(0, 19)]);
          
          toast({
            title: "New Contact Message",
            description: `From ${newMsg.name}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(subscribersChannel);
      supabase.removeChannel(contactChannel);
    };
  }, [toast]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "subscriber":
        return <Mail className="h-4 w-4 text-green-500" />;
      case "contact":
        return <Phone className="h-4 w-4 text-orange-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge
                  variant="destructive"
                  className="h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs">Real-time updates will appear here</p>
            </div>
          ) : (
            <div className="divide-y">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
