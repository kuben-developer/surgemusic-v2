import { query } from "../_generated/server";

// Centralized admin user IDs for Convex (users._id values)
// Future: expand to multiple admins by adding IDs to this set
const ADMIN_USER_IDS = new Set<string>([
  // Primary admin (Convex user _id)
  "jx76cpkc23rh0f7efc6zzjj00h7nz3r4",
]);

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return false;

    return ADMIN_USER_IDS.has(String(user._id));
  },
});

