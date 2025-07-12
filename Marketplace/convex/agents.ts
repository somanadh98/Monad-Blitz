import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createAgent = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    walletAddress: v.string(),
    pricePerHour: v.number(),
    capabilities: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("agents", {
      ...args,
      ownerUserId: userId,
      status: "active",
      totalEarnings: 0,
      reputation: 5.0,
      uptime: 98.5,
      lastActive: Date.now(),
    });
  },
});

export const getMyAgents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("agents")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", userId))
      .collect();
  },
});

export const getAllAgents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(20);
  },
});

export const getNetworkStats = query({
  args: {},
  handler: async (ctx) => {
    const allAgents = await ctx.db.query("agents").collect();
    const activeAgents = allAgents.filter(agent => agent.status === "active");
    const totalEarnings = allAgents.reduce((sum, agent) => sum + agent.totalEarnings, 0);
    
    return {
      totalAgents: allAgents.length,
      activeAgents: activeAgents.length,
      totalVolume: totalEarnings,
      averageUptime: allAgents.length > 0 ? 
        allAgents.reduce((sum, agent) => sum + agent.uptime, 0) / allAgents.length : 0,
    };
  },
});

export const updateAgentStatus = mutation({
  args: {
    agentId: v.id("agents"),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("busy")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const agent = await ctx.db.get(args.agentId);
    if (!agent || agent.ownerUserId !== userId) {
      throw new Error("Agent not found or not owned by user");
    }

    await ctx.db.patch(args.agentId, {
      status: args.status,
      lastActive: Date.now(),
    });
  },
});
