import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const crons = cronJobs();

// Update agent uptime and status every 5 minutes
crons.interval(
  "update agent metrics",
  { minutes: 5 },
  internal.crons.updateAgentMetrics,
  {}
);

// Clean up old chat messages every day
crons.interval(
  "cleanup old messages",
  { hours: 24 },
  internal.crons.cleanupOldMessages,
  {}
);

// Create periodic agent-to-agent transactions every 10 minutes
crons.interval(
  "agent to agent transactions",
  { minutes: 10 },
  internal.crons.createAgentTransactions,
  {}
);

export const updateAgentMetrics = internalMutation({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    
    for (const agent of agents) {
      const uptimeChange = (Math.random() - 0.5) * 2;
      const newUptime = Math.max(85, Math.min(99.9, agent.uptime + uptimeChange));
      
      await ctx.db.patch(agent._id, {
        uptime: newUptime,
        lastActive: Date.now(),
      });
    }
  },
});

export const cleanupOldMessages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const oldMessages = await ctx.db
      .query("chatMessages")
      .filter((q) => q.lt(q.field("timestamp"), oneWeekAgo))
      .collect();
    
    for (const message of oldMessages) {
      await ctx.db.delete(message._id);
    }
  },
});

export const createAgentTransactions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").withIndex("by_status", (q) => q.eq("status", "active")).collect();
    if (agents.length < 2) return;
    
    const from = agents[Math.floor(Math.random() * agents.length)];
    const to = agents[Math.floor(Math.random() * agents.length)];
    if (from._id === to._id) return;
    
    await ctx.db.insert("transactions", {
      fromAgentId: from._id,
      toAgentId: to._id,
      amount: Math.floor(Math.random() * 50) + 10,
      token: Math.random() > 0.5 ? "USDC" : "DAI",
      serviceDescription: "Automated agent service",
      duration: Math.floor(Math.random() * 4) + 1,
      status: "pending",
      fromUserId: from.ownerUserId,
      toUserId: to.ownerUserId,
    });
  },
});

export default crons;
