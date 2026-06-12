import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  waitlistEntries: defineTable({
    email: v.string(),
    normalizedEmail: v.string(),
    createdAt: v.number(),
    source: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_normalized_email", ["normalizedEmail"])
    .index("by_created_at", ["createdAt"]),
});
