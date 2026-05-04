import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
      .select("status, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError) {
      console.error("Subscription check error:", subError.message);
      return res.status(500).json({ error: "Failed to verify subscription" });
    }

    if (!sub || sub.status !== "active" || !sub.stripe_customer_id) {
      return res.status(403).json({ error: "Active subscription with billing record required" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: "https://quarterlytax-xi.vercel.app",
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Portal session error:", err.message);
    return res.status(500).json({ error: "Failed to create billing portal session" });
  }
}
