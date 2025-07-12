import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyEarnings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        totalEarnings: 0,
        earnings24h: 0,
        earningsThisMonth: 0,
        pendingEarnings: 0,
        earningsHistory: [],
      };
    }

    const myAgents = await ctx.db
      .query("agents")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", userId))
      .collect();

    const agentIds = myAgents.map(agent => agent._id);
    
    // Get all transactions where user received payment
    const receivedTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_to_user", (q) => q.eq("toUserId", userId))
      .collect();

    const confirmedTransactions = receivedTransactions.filter(tx => tx.status === "confirmed");
    const pendingTransactions = receivedTransactions.filter(tx => tx.status === "pending");
    
    const totalEarnings = confirmedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const pendingEarnings = pendingTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate 24h earnings
    const last24h = Date.now() - (24 * 60 * 60 * 1000);
    const earnings24h = confirmedTransactions
      .filter(tx => tx._creationTime > last24h)
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate this month earnings
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const earningsThisMonth = confirmedTransactions
      .filter(tx => tx._creationTime > thisMonth.getTime())
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Earnings history (last 7 days)
    const earningsHistory = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayEarnings = confirmedTransactions
        .filter(tx => tx._creationTime >= date.getTime() && tx._creationTime < nextDate.getTime())
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      earningsHistory.push({
        date: date.toISOString().split('T')[0],
        earnings: dayEarnings,
      });
    }

    return {
      totalEarnings,
      earnings24h,
      earningsThisMonth,
      pendingEarnings,
      earningsHistory,
    };
  },
});

export const getAgentEarnings = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const agent = await ctx.db.get(args.agentId);
    if (!agent || agent.ownerUserId !== userId) {
      throw new Error("Agent not found or not owned by user");
    }

    const transactions = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("toAgentId"), args.agentId))
      .collect();

    const confirmedTransactions = transactions.filter(tx => tx.status === "confirmed");
    const totalEarnings = confirmedTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    return {
      agentId: args.agentId,
      totalEarnings,
      transactionCount: confirmedTransactions.length,
      averageTransactionValue: confirmedTransactions.length > 0 ? totalEarnings / confirmedTransactions.length : 0,
    };
  },
});
