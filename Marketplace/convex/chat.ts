import { query, mutation, internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const sendMessage = mutation({
  args: {
    message: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.insert("chatMessages", {
      userId,
      message: args.message,
      isBot: false,
      timestamp: Date.now(),
      context: args.context,
    });

    // Schedule bot response
    await ctx.scheduler.runAfter(1000, internal.chat.generateBotResponse, {
      userId,
      userMessage: args.message,
      context: args.context,
    });
  },
});

export const getChatHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const generateBotResponse = internalAction({
  args: {
    userId: v.id("users"),
    userMessage: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const message = args.userMessage.toLowerCase();
    let botResponse = "";

    if (message.includes("help") || message.includes("how")) {
      botResponse = "🤖 Welcome to AI Agent Payment Rails! I can help you with:\n\n• Creating and managing AI agents\n• Understanding payment flows\n• Checking transaction history\n• Exploring the marketplace\n• Setting up services\n\nWhat would you like to know?";
    } else if (message.includes("agent") && (message.includes("create") || message.includes("deploy"))) {
      botResponse = "🚀 To deploy a new AI agent:\n\n1. Click 'Deploy New Agent'\n2. Enter agent details and capabilities\n3. Set your pricing (USDC/hour)\n4. Add your wallet address\n5. Choose a category\n\nYour agent will be live on the network instantly!";
    } else if (message.includes("transaction") || message.includes("payment")) {
      botResponse = "💳 Payments on our platform are:\n\n• Instant settlement on Monad blockchain\n• Support for USDC and DAI\n• Low gas fees\n• Automatic escrow protection\n\nTo pay an agent, browse the marketplace and select 'Hire Agent'!";
    } else if (message.includes("earning") || message.includes("money")) {
      botResponse = "💰 Maximize your agent earnings:\n\n• Keep agents active (high uptime)\n• Offer competitive pricing\n• Provide quality services\n• Build reputation through good work\n• Respond quickly to requests\n\nActive agents earn 3x more on average!";
    } else if (message.includes("marketplace") || message.includes("browse")) {
      botResponse = "🏪 The Agent Marketplace features:\n\n• 500+ active AI agents\n• Categories: Compute, Data, Creative, Trading\n• Real-time availability status\n• Reputation scoring\n• Instant hiring\n\nBrowse by category or search for specific capabilities!";
    } else if (message.includes("wallet") || message.includes("address")) {
      botResponse = "🔐 Wallet Integration:\n\n• Connect MetaMask or Phantom wallet\n• Support for Ethereum, Monad, Solana\n• Automatic payment routing\n• Secure key management\n\nGo to the 'Wallet' tab to connect!";
    } else if (message.includes("metamask") || message.includes("phantom")) {
      botResponse = "💼 Supported Wallets:\n\n🦊 MetaMask: Ethereum & Monad\n👻 Phantom: Solana network\n\nBoth support instant payments!";
    } else {
      botResponse = "🤖 I'm here to help! Ask about:\n\n• 'How to get started'\n• 'MetaMask and Phantom'\n• 'Supported networks'\n• 'Platform fees'\n• 'Creating agents'\n\nWhat interests you?";
    }

    await ctx.runMutation(internal.chat.addBotMessage, {
      userId: args.userId,
      message: botResponse,
    });
  },
});

export const addBotMessage = internalMutation({
  args: {
    userId: v.id("users"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("chatMessages", {
      userId: args.userId,
      message: args.message,
      isBot: true,
      timestamp: Date.now(),
    });
  },
});
