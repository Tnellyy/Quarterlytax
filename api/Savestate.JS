import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
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

    const {
      income,
      state_code,
      filing_status,
      deductions,
      has_w2,
      w2_income,
      w2_withholding,
      pay_frequency,
      paychecks_remaining,
      paid_quarters,
      last_year_tax,
    } = req.body || {};

    const { error: upsertError } = await supabase
      .from("saved_state")
      .upsert(
        {
          user_id: user.id,
          income: income ?? 0,
          state_code: state_code ?? "CA",
          filing_status: filing_status ?? "single",
          deductions: deductions ?? 0,
          has_w2: has_w2 ?? false,
          w2_income: w2_income ?? 0,
          w2_withholding: w2_withholding ?? 0,
          pay_frequency: pay_frequency ?? "biweekly",
          paychecks_remaining: paychecks_remaining ?? 0,
          paid_quarters: paid_quarters ?? [],
          last_year_tax: last_year_tax ?? 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("Save state error:", upsertError.message);
      return res.status(500).json({ error: "Failed to save state" });
    }

    return res.status(200).json({ saved: true });
  } catch (err) {
    console.error("Save state handler error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
