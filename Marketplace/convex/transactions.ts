import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const createTransaction = mutation({
  args: {
    fromAgentId: v.id("agents"),
    toAgentId: v.id("agents"),
    amount: v.number(),
    token: v.union(v.literal("USDC"), v.literal("DAI")),
    serviceDescription: v.string(),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const fromAgent = await ctx.db.get(args.fromAgentId);
    const toAgent = await ctx.db.get(args.toAgentId);

    if (!fromAgent || !toAgent) {
      throw new Error("Agent not found");
    }

    if (fromAgent.ownerUserId !== userId) {
      throw new Error("Not authorized to use this agent");
    }

    const transactionId = await ctx.db.insert("transactions", {
      ...args,
      status: "pending",
      fromUserId: fromAgent.ownerUserId,
      toUserId: toAgent.ownerUserId,
    });

    // Simulate transaction confirmation after 3 seconds
    await ctx.scheduler.runAfter(3000, internal.transactions.confirmTransaction, {
      transactionId,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    });

    return transactionId;
  },
});

export const getMyTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const sentTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", userId))
      .order("desc")
      .take(10);

    const receivedTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_to_user", (q) => q.eq("toUserId", userId))
      .order("desc")
      .take(10);

    return [...sentTransactions, ...receivedTransactions]
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 15);
  },
});

export const confirmTransaction = internalMutation({
  args: {
    transactionId: v.id("transactions"),
    txHash: v.string(),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    await ctx.db.patch(args.transactionId, {
      status: "confirmed",
      txHash: args.txHash,
    });

    // Update agent earnings
    const toAgent = await ctx.db.get(transaction.toAgentId);
    if (toAgent) {
      await ctx.db.patch(transaction.toAgentId, {
        totalEarnings: toAgent.totalEarnings + transaction.amount,
      });
    }
  },
});
