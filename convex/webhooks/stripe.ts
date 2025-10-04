import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import Stripe from "stripe";

export const stripeWebhook = httpAction(async (ctx, request) => {
  // Initialize Stripe inside the handler
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  const creditAmounts: Record<string, number> = {
    [process.env.NEXT_PUBLIC_STRIPE_CREDITS_30_PRICE!]: 30,
    [process.env.NEXT_PUBLIC_STRIPE_CREDITS_60_PRICE!]: 60,
    [process.env.NEXT_PUBLIC_STRIPE_CREDITS_90_PRICE!]: 90,
    [process.env.NEXT_PUBLIC_STRIPE_CREDITS_120_PRICE!]: 120,
  };

  const subscriptionCredits: Record<string, number> = {
    [process.env.NEXT_PUBLIC_STRIPE_STARTER_M_PRICE!]: 60,
    [process.env.NEXT_PUBLIC_STRIPE_GROWTH_M_PRICE!]: 240,
    [process.env.NEXT_PUBLIC_STRIPE_PRO_M_PRICE!]: 720,
    [process.env.NEXT_PUBLIC_STRIPE_ULTIMATE_M_PRICE!]: 3000,
    [process.env.NEXT_PUBLIC_STRIPE_STARTER_Y_PRICE!]: 60 * 12,
    [process.env.NEXT_PUBLIC_STRIPE_GROWTH_Y_PRICE!]: 240 * 12,
    [process.env.NEXT_PUBLIC_STRIPE_PRO_Y_PRICE!]: 720 * 12,
    [process.env.NEXT_PUBLIC_STRIPE_ULTIMATE_Y_PRICE!]: 3000 * 12,
  };
  const body = await request.text();
  const signature = request.headers.get("Stripe-Signature") ?? "";

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
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
          await ctx.runMutation(internal.webhooks.stripe.addCredits, {
            userId: userId as any,
            credits: creditAmounts[priceId],
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

      await ctx.runMutation(internal.webhooks.stripe.cancelSubscription, {
        userId: userId as any,
      });
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;

      // Only process subscription invoices
      const subscriptionId = (invoice as any).subscription || (invoice as any).parent.subscription_details.subscription;
      if (!subscriptionId) break;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
      const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
      const userId = customer.metadata.userId;

      if (!userId) {
        return new Response("No userId in customer metadata", { status: 400 });
      }

      // Get the price ID from the subscription
      const subscriptionPriceId = subscription.items.data[0]?.price.id;
      const isTrial = subscription.status === 'trialing';

      if (subscriptionPriceId) {
        let credits = isTrial ? 6 : (subscriptionCredits[subscriptionPriceId] ?? 0);

        // Handle cancellation of other subscriptions
        const user = await ctx.runQuery(internal.app.users.getByClerkId, {
          clerkId: customer.metadata.clerkId || "",
        });

        if (user?.billing.stripeCustomerId) {
          // Cancel all active subscriptions except the current one
          const [activeSubscriptions, trialSubscriptions] = await Promise.all([
            stripe.subscriptions.list({
              customer: user.billing.stripeCustomerId,
              status: 'active',
            }),
            !isTrial ? stripe.subscriptions.list({
              customer: user.billing.stripeCustomerId,
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

        await ctx.runMutation(internal.webhooks.stripe.updateSubscription, {
          userId: userId as any,
          subscriptionPriceId: subscriptionPriceId,
          credits: credits,
          isTrial: isTrial,
        });
      }
      break;
    }
  }

  return new Response(null, { status: 200 });
});

// Internal mutations
import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const addCredits = internalMutation({
  args: {
    userId: v.id("users"),
    credits: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      credits: {
        ...user.credits,
        videoGenerationAdditional: user.credits.videoGenerationAdditional + args.credits,
      },
    });
  },
});

export const cancelSubscription = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      billing: {
        ...user.billing,
        subscriptionPriceId: undefined,
        isTrial: false,
      },
    });
  },
});

export const updateSubscription = internalMutation({
  args: {
    userId: v.id("users"),
    subscriptionPriceId: v.string(),
    credits: v.number(),
    isTrial: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      billing: {
        ...user.billing,
        firstTimeUser: false,
        subscriptionPriceId: args.subscriptionPriceId,
        isTrial: args.isTrial,
      },
      credits: {
        ...user.credits,
        videoGeneration: args.credits,
      },
    });
  },
});