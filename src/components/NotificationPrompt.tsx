import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useLanguage } from "@/contexts/LanguageContext";

const DISMISS_KEY = "push-prompt-dismissed";

export const NotificationPrompt = () => {
  const { isSupported, isSubscribed, isLoading, subscribe } = usePushNotifications();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const ne = language === "ne";

  useEffect(() => {
    if (!isSupported || isSubscribed) return;
    if (typeof Notification !== "undefined" && Notification.permission === "denied") return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    const timer = setTimeout(() => setOpen(true), 12000);
    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed]);

  if (!isSupported || isSubscribed) return null;

  const dismiss = () => { localStorage.setItem(DISMISS_KEY, "1"); setOpen(false); };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            className="fixed z-50 bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[360px] rounded-2xl border border-border bg-background/80 backdrop-blur-xl shadow-2xl p-4"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            <button onClick={dismiss} aria-label="Close" className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            <div className="flex gap-3">
              <div className="h-11 w-11 shrink-0 rounded-xl bg-primary/15 flex items-center justify-center">
                <BellRing className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div className="pr-4">
                <p className="font-semibold text-sm">{ne ? "आधिकारिक सूचना पाउनुहोस्" : "Get official updates"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ne ? "मेयर अजमल अख्तर आजादका समाचार र घोषणाहरू तुरुन्तै पाउनुहोस्।" : "Instant news and announcements from Mayor Ajmal Akhtar Azad."}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" size="sm" className="flex-1" onClick={dismiss}>{ne ? "पछि" : "Not now"}</Button>
              <Button size="sm" className="flex-1" disabled={isLoading} onClick={async () => { if (await subscribe()) setOpen(false); }}>
                {ne ? "अनुमति दिनुहोस्" : "Allow"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!open && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setOpen(true)} aria-label="Enable notifications"
          className="fixed z-40 bottom-5 left-5 h-12 w-12 rounded-full bg-background/70 backdrop-blur-xl border border-border shadow-lg flex items-center justify-center hover:scale-105 transition">
          <Bell className="h-5 w-5 text-primary" />
          <span className="absolute top-2.5 right-3 h-2 w-2 rounded-full bg-primary" />
        </motion.button>
      )}
    </>
  );
};
