import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import Stripe from 'stripe';

// Stripe will be initialized inside the actions
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

export const createCheckoutSession = action({
  args: {
    priceId: v.string(),
    trial: v.optional(v.boolean()),
    mode: v.optional(v.union(v.literal("subscription"), v.literal("payment"))),
  },
  handler: async (ctx, args): Promise<string | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(internal.app.users.getByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    let customer: string;
    if (user.billing.stripeCustomerId) {
      customer = user.billing.stripeCustomerId;
    } else {
      const stripe = getStripe();
      const newCustomer = await stripe.customers.create({
        email: identity.email,
        metadata: {
          userId: user._id,
          clerkId: identity.subject,
        },
      });

      await ctx.runMutation(internal.app.users.updateStripeCustomerId, {
        userId: user._id,
        stripeCustomerId: newCustomer.id,
      });

      customer = newCustomer.id;
    }

    const mode = args.mode || "subscription";

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      customer,
      line_items: [
        {
          price: args.priceId,
          quantity: 1,
        },
      ],
      mode,
      ...(mode === "subscription" && args.trial
        ? {
          subscription_data: {
            trial_settings: {
              end_behavior: {
                missing_payment_method: "cancel"
              }
            },
            trial_period_days: 3,
          },
        }
        : {}),
      success_url: `${process.env.DOMAIN_URL}/?success=true`,
      cancel_url: `${process.env.DOMAIN_URL}/pricing?canceled=true`,
      allow_promotion_codes: true,
      metadata: {
        userId: user._id,
        mode,
        isTrial: args.trial ? "true" : "false",
      },
    });

    return session.url;
  },
});

export const createCustomerPortalSession = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(internal.app.users.getByClerkId, {
      clerkId: identity.subject,
    });

    if (!user || !user.billing.stripeCustomerId) {
      throw new Error("No Stripe customer found");
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.billing.stripeCustomerId,
      return_url: `${process.env.DOMAIN_URL}/pricing`,
    });

    return session.url;
  },
});

export const endTrialImmediately = action({
  args: {},
  handler: async (ctx): Promise<Stripe.Subscription> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(internal.app.users.getByClerkId, {
      clerkId: identity.subject,
    });

    if (!user || !user.billing.stripeCustomerId) {
      throw new Error("No Stripe customer found");
    }

    const stripe = getStripe();
    const subscriptions = await stripe.subscriptions.list({
      customer: user.billing.stripeCustomerId,
      status: "trialing",
      limit: 1
    });

    const subscription = subscriptions.data[0];
    if (!subscription) {
      throw new Error("No active subscription found");
    }

    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      trial_end: "now",
      proration_behavior: "always_invoice",
    });

    if (updatedSubscription.status === 'active') {
      await ctx.runMutation(internal.app.users.updateTrial, {
        userId: user._id,
        isTrial: false,
      });
    }

    return updatedSubscription;
  },
});