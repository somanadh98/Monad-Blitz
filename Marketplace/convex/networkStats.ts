import { query } from "./_generated/server";

export const getNetworkStats = query({
  args: {},
  handler: async (ctx) => {
    const allAgents = await ctx.db.query("agents").collect();
    const allTransactions = await ctx.db.query("transactions").collect();
    
    const activeAgents = allAgents.filter(agent => agent.status === "active");
    const totalVolume = allTransactions
      .filter(tx => tx.status === "confirmed")
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const averageUptime = allAgents.length > 0 ? 
      allAgents.reduce((sum, agent) => sum + agent.uptime, 0) / allAgents.length : 0;

    // Calculate 24h stats
    const last24h = Date.now() - (24 * 60 * 60 * 1000);
    const recent24hTransactions = allTransactions.filter(tx => tx._creationTime > last24h);
    const volume24h = recent24hTransactions
      .filter(tx => tx.status === "confirmed")
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      totalAgents: allAgents.length,
      activeAgents: activeAgents.length,
      totalVolume,
      volume24h,
      averageUptime,
      totalTransactions: allTransactions.length,
      transactions24h: recent24hTransactions.length,
      networkHealth: averageUptime > 95 ? "excellent" : averageUptime > 85 ? "good" : "fair",
    };
  },
});
