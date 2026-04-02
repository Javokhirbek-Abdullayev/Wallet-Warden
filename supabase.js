/* Wallet Warden — Supabase client (CDN global: window.supabase) */
(function () {
  const SUPABASE_URL = "https://bjosrtfqcvacisdpihwt.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqb3NydGZxY3ZhY2lzZHBpaHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzczMjEsImV4cCI6MjA5MDcxMzMyMX0.2ZunkaqADfWs_Ze52l3lnTLHAc5E2jYzDHBN_V4ExtE";

  if (typeof window === "undefined" || !window.supabase || typeof window.supabase.createClient !== "function") {
    window.wwSupabaseClient = null;
    return;
  }

  window.wwSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "implicit",
      storage: typeof window !== "undefined" ? window.localStorage : undefined
    }
  });

  window.syncToCloud = async function syncToCloud(appData) {
    const supabase = window.wwSupabaseClient;
    if (!supabase) return;
    try {
      const {
        data: { user },
        error: userErr
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) return;
      const { error } = await supabase.from("user_data").upsert(
        {
          user_id: user.id,
          data: appData,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      );
      if (error) throw error;
    } catch (e) {
      try {
        localStorage.setItem("ww_sync_pending", "true");
      } catch (_) {}
      throw e;
    }
  };

  window.loadFromCloud = async function loadFromCloud() {
    const supabase = window.wwSupabaseClient;
    if (!supabase) return null;
    try {
      const {
        data: { user },
        error: userErr
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) return null;
      const { data, error } = await supabase.from("user_data").select("data").eq("user_id", user.id).single();
      if (error && error.code !== "PGRST116") throw error;
      return data && data.data != null ? data.data : null;
    } catch (e) {
      return null;
    }
  };
})();
