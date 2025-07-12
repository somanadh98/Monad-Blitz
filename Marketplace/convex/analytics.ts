import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const myAgents = await ctx.db
      .query("agents")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", userId))
      .collect();

    const myTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_to_user", (q) => q.eq("toUserId", userId))
      .collect();

    const confirmedTransactions = myTransactions.filter(tx => tx.status === "confirmed");

    // Performance metrics
    const totalEarnings = confirmedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const averageTransactionValue = confirmedTransactions.length > 0 ? 
      totalEarnings / confirmedTransactions.length : 0;

    // Agent performance
    const agentPerformance = myAgents.map(agent => {
      const agentTransactions = confirmedTransactions.filter(tx => tx.toAgentId === agent._id);
      const agentEarnings = agentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      
      return {
        agentId: agent._id,
        name: agent.name,
        earnings: agentEarnings,
        transactionCount: agentTransactions.length,
        uptime: agent.uptime,
        reputation: agent.reputation,
        utilizationRate: agentTransactions.length > 0 ? 
          (agentTransactions.length / (Date.now() - agent._creationTime)) * 86400000 : 0, // transactions per day
      };
    });

    // Monthly earnings trend
    const monthlyEarnings = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      const nextMonth = new Date(date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const monthEarnings = confirmedTransactions
        .filter(tx => tx._creationTime >= date.getTime() && tx._creationTime < nextMonth.getTime())
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      monthlyEarnings.push({
        month: date.toISOString().slice(0, 7), // YYYY-MM format
        earnings: monthEarnings,
      });
    }

    return {
      totalEarnings,
      averageTransactionValue,
      totalTransactions: confirmedTransactions.length,
      agentPerformance,
      monthlyEarnings,
      topPerformingAgent: agentPerformance.sort((a, b) => b.earnings - a.earnings)[0] || null,
    };
  },
});
