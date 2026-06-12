import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const join = mutation({
  args: {
    email: v.string(),
    source: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  returns: v.object({
    status: v.union(v.literal("joined"), v.literal("already_joined")),
    email: v.string(),
  }),
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);

    if (!isValidEmail(normalizedEmail)) {
      throw new Error("Please enter a valid email address.");
    }

    const existing = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_normalized_email", (q) => q.eq("normalizedEmail", normalizedEmail))
      .unique();

    if (existing) {
      return { status: "already_joined" as const, email: normalizedEmail };
    }

    await ctx.db.insert("waitlistEntries", {
      email: args.email.trim(),
      normalizedEmail,
      createdAt: Date.now(),
      source: args.source,
      userAgent: args.userAgent,
    });

    return { status: "joined" as const, email: normalizedEmail };
  },
});

export const count = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const entries = await ctx.db.query("waitlistEntries").collect();
    return entries.length;
  },
});
