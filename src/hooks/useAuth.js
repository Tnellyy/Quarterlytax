import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

// Subscription status values:
// 'loading'    — initial fetch in progress
// 'none'       — no subscription row exists
// 'active'     — paid and current
// 'cancelled'  — user cancelled
// 'past_due'   — payment failed
// 'inactive'   — default/fallback

async function fetchSubscriptionStatus(userId) {
  if (!supabase || !userId) return "none";
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      console.error("Subscription fetch error:", error.message);
      return "none";
    }
    return data?.status || "none";
  } catch (err) {
    console.error("Subscription fetch failed:", err);
    return "none";
  }
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("loading");
  const [authLoading, setAuthLoading] = useState(true);

  // Fetch subscription whenever user changes
  const refreshSubscription = useCallback(async (userId) => {
    if (!userId) {
      setSubscriptionStatus("none");
      return;
    }
    setSubscriptionStatus("loading");
    const status = await fetchSubscriptionStatus(userId);
    setSubscriptionStatus(status);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      setSubscriptionStatus("none");
      return;
    }

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        refreshSubscription(s.user.id);
      } else {
        setSubscriptionStatus("none");
      }
      setAuthLoading(false);
    });

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          refreshSubscription(s.user.id);
        } else {
          setSubscriptionStatus("none");
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [refreshSubscription]);

  const signUp = useCallback(async (email, password) => {
    if (!supabase) return { error: { message: "Supabase not configured" } };
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!supabase) return { error: { message: "Supabase not configured" } };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setSubscriptionStatus("none");
  }, []);

  // Convenience booleans
  const isAuthenticated = !!user;
  const isPaid = subscriptionStatus === "active";
  const isFree = isAuthenticated && !isPaid;

  return {
    user,
    session,
    subscriptionStatus,
    authLoading,
    isAuthenticated,
    isPaid,
    isFree,
    signUp,
    signIn,
    signOut,
    refreshSubscription,
  };
}
