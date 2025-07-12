import { query } from "./_generated/server";
import { v } from "convex/values";

export const getMarketplaceAgents = query({
  args: {
    category: v.optional(v.string()),
    sortBy: v.optional(v.union(v.literal("price"), v.literal("reputation"), v.literal("earnings"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("agents").withIndex("by_status", (q) => q.eq("status", "active"));
    
    if (args.category) {
      query = ctx.db.query("agents").withIndex("by_category", (q) => q.eq("category", args.category!));
    }

    let agents = await query.take(args.limit || 20);

    // Filter only active agents if category filter was applied
    if (args.category) {
      agents = agents.filter(agent => agent.status === "active");
    }

    // Sort agents
    if (args.sortBy === "price") {
      agents.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else if (args.sortBy === "reputation") {
      agents.sort((a, b) => b.reputation - a.reputation);
    } else if (args.sortBy === "earnings") {
      agents.sort((a, b) => b.totalEarnings - a.totalEarnings);
    }

    return agents;
  },
});

export const getAgentCategories = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    const categories = [...new Set(agents.map(agent => agent.category))];
    
    const categoryStats = categories.map(category => {
      const categoryAgents = agents.filter(agent => agent.category === category);
      const activeAgents = categoryAgents.filter(agent => agent.status === "active");
      
      return {
        name: category,
        totalAgents: categoryAgents.length,
        activeAgents: activeAgents.length,
        averagePrice: categoryAgents.length > 0 ? 
          categoryAgents.reduce((sum, agent) => sum + agent.pricePerHour, 0) / categoryAgents.length : 0,
      };
    });

    return categoryStats;
  },
});

export const searchAgents = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const allAgents = await ctx.db.query("agents").collect();
    const searchTerm = args.searchTerm.toLowerCase();
    
    return allAgents.filter(agent => 
      agent.status === "active" && (
        agent.name.toLowerCase().includes(searchTerm) ||
        agent.description.toLowerCase().includes(searchTerm) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(searchTerm)) ||
        agent.category.toLowerCase().includes(searchTerm)
      )
    );
  },
});
