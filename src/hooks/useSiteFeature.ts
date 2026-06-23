import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const db: any = supabase;

export function useSiteFeature(key: string, defaultEnabled = true) {
  const [enabled, setEnabled] = useState<boolean>(defaultEnabled);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await db
        .from("site_features")
        .select("enabled")
        .eq("key", key)
        .maybeSingle();
      if (!mounted) return;
      if (data) setEnabled(!!data.enabled);
      setLoading(false);
    };
    load();

    const channel = db
      .channel(`site_features:${key}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_features", filter: `key=eq.${key}` },
        (payload: any) => {
          if (payload.new?.enabled !== undefined) setEnabled(!!payload.new.enabled);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      db.removeChannel(channel);
    };
  }, [key]);

  return { enabled, loading };
}

export async function setSiteFeature(key: string, enabled: boolean) {
  const { error } = await db
    .from("site_features")
    .upsert({ key, enabled, updated_at: new Date().toISOString() }, { onConflict: "key" });
  return { error };
}
