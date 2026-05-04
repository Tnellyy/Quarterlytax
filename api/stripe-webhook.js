import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export const config = { api: { bodyParser: false } };

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function tsToISO(ts) {
  return ts ? new Date(ts * 1000).toISOString() : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let event;
  try {
    const rawBody = await getRawBody(req);
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const stripeCustomerId = session.customer;
      const stripeSubscriptionId = session.subscription;

      if (!userId) {
        console.error("checkout.session.completed missing client_reference_id");
        return res.status(200).json({ received: true, skipped: "no user id" });
      }

      const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

      const { error } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            status: subscription.status,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            current_period_end: tsToISO(subscription.current_period_end),
            cancel_at_period_end: subscription.cancel_at_period_end || false,
            canceled_at: tsToISO(subscription.canceled_at),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Supabase upsert error (checkout):", error.message);
        return res.status(500).json({ error: "Database update failed" });
      }

      return res.status(200).json({ received: true, type: event.type });
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object;

      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: subscription.status,
          current_period_end: tsToISO(subscription.current_period_end),
          cancel_at_period_end: subscription.cancel_at_period_end || false,
          canceled_at: tsToISO(subscription.canceled_at),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        console.error("Supabase update error (subscription.updated):", error.message);
        return res.status(500).json({ error: "Database update failed" });
      }

      return res.status(200).json({ received: true, type: event.type });
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;

      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          current_period_end: tsToISO(subscription.current_period_end),
          cancel_at_period_end: false,
          canceled_at: tsToISO(subscription.canceled_at) || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        console.error("Supabase update error (subscription.deleted):", error.message);
        return res.status(500).json({ error: "Database update failed" });
      }

      return res.status(200).json({ received: true, type: event.type });
    }

    return res.status(200).json({ received: true, type: event.type, handled: false });
  } catch (err) {
    console.error("Webhook handler error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
