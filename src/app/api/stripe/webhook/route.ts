import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { getSupabase, mutate, touched } from "@/lib/supabase/server";
import { TABLES, type OrderRow } from "@/lib/supabase/types";

/**
 * STRIPE WEBHOOK
 * ==============
 * Called by Stripe, not by the site. The signature is verified before anything
 * is written, so a forged request cannot mark an order as paid.
 *
 * This handler stays on the raw body on purpose: `req.text()` must be read
 * before parsing, because signature verification is done over the exact bytes
 * Stripe sent.
 */

type OrderPatch = Partial<Pick<OrderRow, "status" | "paymentStatus" | "paymentIntentId">>;

async function patchOrder(orderId: string, patch: OrderPatch): Promise<void> {
  await mutate(
    getSupabase().from(TABLES.order).update(touched(patch)).eq("id", orderId)
  );
}

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        if (intent.metadata.orderId) {
          await patchOrder(intent.metadata.orderId, {
            status: "CONFIRMED",
            paymentStatus: "PAID",
            paymentIntentId: intent.id,
          });
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        if (intent.metadata.orderId) {
          await patchOrder(intent.metadata.orderId, { paymentStatus: "FAILED" });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // Returning a 500 tells Stripe to retry, which is what we want when the
    // database was briefly unavailable.
    console.error("[api] stripe webhook failed:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
