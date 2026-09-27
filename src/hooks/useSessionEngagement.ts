import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "pp_session_id";

const getSessionId = () => {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

/**
 * Privacy-conscious first-party engagement tracking.
 * Stores only an anonymous session id, landing path, page-view count and an
 * "engaged" flag (scrolled or stayed 10s+). No personal data, no cookies.
 */
export const useSessionEngagement = () => {
  const location = useLocation();
  const started = useRef(false);
  const views = useRef(0);
  const engaged = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const sessionId = getSessionId();
    const landingPath = window.location.pathname;
    views.current = 1;

    const markEngaged = () => { engaged.current = true; };
    const scrollHandler = () => {
      if (window.scrollY > 200) markEngaged();
    };
    const timer = setTimeout(markEngaged, 10_000);
    window.addEventListener("scroll", scrollHandler, { passive: true });

    void supabase.from("page_sessions").insert({
      session_id: sessionId,
      landing_path: landingPath,
      page_views: 1,
      engaged: false,
    });

    const flush = () => {
      void supabase
        .from("page_sessions")
        .update({ page_views: views.current, engaged: engaged.current, updated_at: new Date().toISOString() })
        .eq("session_id", sessionId);
    };
    window.addEventListener("beforeunload", flush);
    const interval = setInterval(flush, 30_000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, []);

  // Count subsequent in-app navigations as extra page views (not bounces).
  useEffect(() => {
    if (!started.current) return;
    views.current += 1;
    engaged.current = true;
  }, [location.pathname]);
};
