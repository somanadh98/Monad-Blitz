import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  agents: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(),
    ownerUserId: v.id("users"),
    walletAddress: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("busy")),
    pricePerHour: v.number(),
    totalEarnings: v.number(),
    reputation: v.number(),
    capabilities: v.array(v.string()),
    avatar: v.optional(v.string()),
    uptime: v.number(),
    lastActive: v.number(),
  })
    .index("by_owner", ["ownerUserId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"]),

  transactions: defineTable({
    fromAgentId: v.id("agents"),
    toAgentId: v.id("agents"),
    amount: v.number(),
    token: v.union(v.literal("USDC"), v.literal("DAI")),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("failed")),
    txHash: v.optional(v.string()),
    serviceDescription: v.string(),
    duration: v.optional(v.number()),
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
  })
    .index("by_from_user", ["fromUserId"])
    .index("by_to_user", ["toUserId"]),

  chatMessages: defineTable({
    userId: v.id("users"),
    message: v.string(),
    isBot: v.boolean(),
    timestamp: v.number(),
    context: v.optional(v.string()),
  })
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
