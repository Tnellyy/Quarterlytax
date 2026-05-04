import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

async function fetchSubscriptionData(userId) {
  if (!supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("status, current_period_end, cancel_at_period_end, canceled_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      console.error("Subscription fetch error:", error.message);
      return null;
    }
    return data || null;
  } catch (err) {
    console.error("Subscription fetch failed:", err);
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("loading");
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshSubscription = useCallback(async (userId) => {
    if (!userId) {
      setSubscriptionStatus("none");
      setSubscriptionData(null);
      return;
    }
    setSubscriptionStatus("loading");
    const data = await fetchSubscriptionData(userId);
    if (data) {
      setSubscriptionData(data);
      setSubscriptionStatus(data.status || "none");
    } else {
      setSubscriptionData(null);
      setSubscriptionStatus("none");
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      setSubscriptionStatus("none");
      return;
    }

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

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          refreshSubscription(s.user.id);
        } else {
          setSubscriptionStatus("none");
          setSubscriptionData(null);
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
    setSubscriptionData(null);
  }, []);

  const isAuthenticated = !!user;

  const cancelAtPeriodEnd = subscriptionData?.cancel_at_period_end || false;
  const currentPeriodEnd = subscriptionData?.current_period_end || null;

  // isPaid: active status + period end in the future (or missing as fallback)
  let isPaid = false;
  if (subscriptionStatus === "active") {
    if (currentPeriodEnd) {
      isPaid = new Date(currentPeriodEnd) > new Date();
    } else {
      isPaid = true; // fallback if period end is missing
    }
  }

  const isFree = isAuthenticated && !isPaid;

  return {
    user,
    session,
    subscriptionStatus,
    subscriptionData,
    authLoading,
    isAuthenticated,
    isPaid,
    isFree,
    cancelAtPeriodEnd,
    currentPeriodEnd,
    signUp,
    signIn,
    signOut,
    refreshSubscription,
  };
}
