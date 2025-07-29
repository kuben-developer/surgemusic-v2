import { db } from "@/server/db";
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const creditAmounts: Record<string, number> = {
  [process.env.NEXT_PUBLIC_STRIPE_CREDITS_30_PRICE_ID!]: 30,
  [process.env.NEXT_PUBLIC_STRIPE_CREDITS_60_PRICE_ID!]: 60,
  [process.env.NEXT_PUBLIC_STRIPE_CREDITS_90_PRICE_ID!]: 90,
  [process.env.NEXT_PUBLIC_STRIPE_CREDITS_120_PRICE_ID!]: 120,
};

const subscriptionCredits: Record<string, number> = {
  [process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID!]: 30,
  [process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID!]: 120,
  [process.env.NEXT_PUBLIC_STRIPE_ULTIMATE_MONTHLY_PRICE_ID!]: 360,
  [process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID!]: 30 * 12,
  [process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_YEARLY_PRICE_ID!]: 120 * 12,
  [process.env.NEXT_PUBLIC_STRIPE_ULTIMATE_YEARLY_PRICE_ID!]: 360 * 12,
};

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`,
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const mode = session.metadata?.mode;

      if (!userId) {
        return new Response("No userId in metadata", { status: 400 });
      }

      // Only handle one-time payments here
      if (mode === "payment") {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;

        if (priceId && creditAmounts[priceId]) {
          await db.user.update({
            where: { id: userId },
            data: {
              videoGenerationAdditionalCredit: {
                increment: creditAmounts[priceId],
              },
            },
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
      const userId = customer.metadata.userId;

      if (!userId) {
        return new Response("No userId in customer metadata", { status: 400 });
      }

      if (subscription.cancellation_details?.comment === 'dev_cancel') {
        break;
      }

      await db.user.update({
        where: { id: userId },
        data: {
          subscriptionPriceId: null,
          isTrial: false,
        },
      });
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;

      // Only process subscription invoices
      if (!invoice.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
      const userId = customer.metadata.userId;

      if (!userId) {
        return new Response("No userId in customer metadata", { status: 400 });
      }

      // Get the price ID from the subscription
      const subscriptionPriceId = subscription.items.data[0]?.price.id;
      const isTrial = subscription.status === 'trialing';

      if (subscriptionPriceId) {
        let credits = isTrial ? 5 : (subscriptionCredits[subscriptionPriceId] ?? 0);

        // Handle cancellation of other subscriptions
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { stripeCustomerId: true },
        });

        if (user?.stripeCustomerId) {
          // Cancel all active subscriptions except the current one
          const [activeSubscriptions, trialSubscriptions] = await Promise.all([
            stripe.subscriptions.list({
              customer: user.stripeCustomerId,
              status: 'active',
            }),
            !isTrial ? stripe.subscriptions.list({
              customer: user.stripeCustomerId,
              status: 'trialing',
            }) : null
          ]);

          const subscriptionsToCancel = [
            ...activeSubscriptions.data.filter(sub => sub.id !== subscription.id),
            ...(trialSubscriptions?.data || [])
          ];

          await Promise.all(subscriptionsToCancel.map(sub =>
            stripe.subscriptions.cancel(sub.id, {
              cancellation_details: {
                comment: 'dev_cancel',
              }
            })
          ));
        }

        await db.user.update({
          where: { id: userId },
          data: {
            firstTimeUser: false,
            subscriptionPriceId: subscriptionPriceId,
            videoGenerationCredit: credits,
            isTrial: isTrial,
          },
        });
      }
      break;
    }

    // case "customer.subscription.updated": {
    //   const subscription = event.data.object as Stripe.Subscription;
    //   const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    //   const userId = customer.metadata.userId;
    //   const subscriptionPriceId = subscription.items.data[0]?.price.id;

    //   if (!userId) {
    //     return new Response("No userId in customer metadata", { status: 400 });
    //   }

    //   if (event.data.previous_attributes?.latest_invoice) {
    //     break;
    //   }

    //   if (subscriptionPriceId) {
    //     await db.user.update({
    //       where: { id: userId },
    //       data: {
    //         subscriptionPriceId: subscriptionPriceId,
    //         videoGenerationCredit: subscriptionCredits[subscriptionPriceId] ?? 0,
    //       },
    //     });
    //   }
    //   break;
    // }
  }

  return new Response(null, { status: 200 });
} 