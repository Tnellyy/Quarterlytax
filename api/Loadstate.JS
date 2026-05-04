import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }
  const token = authHeader.replace("Bearer ", "");

  let user;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    user = data.user;
  } catch (err) {
    return res.status(401).json({ error: "Authentication failed" });
  }

  try {
    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError) {
      console.error("Subscription check error:", subError.message);
      return res.status(500).json({ error: "Failed to verify subscription" });
    }

    if (!sub || sub.status !== "active") {
      return res.status(403).json({ error: "Active subscription required" });
    }

    const { data: state, error: stateError } = await supabase
      .from("saved_state")
      .select("income, state_code, filing_status, deductions, has_w2, w2_income, w2_withholding, pay_frequency, paychecks_remaining, paid_quarters, last_year_tax, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (stateError) {
      console.error("Load state error:", stateError.message);
      return res.status(500).json({ error: "Failed to load state" });
    }

    return res.status(200).json({ state: state || null });
  } catch (err) {
    console.error("Load state handler error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
