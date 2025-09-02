import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveIssueHistory = mutation({
  args: {
    userId: v.id("users"),
    originalInput: v.string(),
    workType: v.union(
      v.literal("bug"),
      v.literal("documentation"),
      v.literal("testing"),
      v.literal("feature"),
      v.literal("infrastructure"),
      v.literal("research")
    ),
    finalIssue: v.object({
      title: v.string(),
      description: v.string(),
      priority: v.union(
        v.literal("critical"),
        v.literal("high"),
        v.literal("medium"),
        v.literal("low")
      ),
      team: v.optional(v.string()),
      assignee: v.optional(v.string()),
      labels: v.array(v.string()),
      linearIssueId: v.optional(v.string()),
      linearIssueUrl: v.optional(v.string()),
    }),
    corrections: v.array(v.object({
      field: v.string(),
      originalValue: v.string(),
      correctedValue: v.string(),
      timestamp: v.number(),
    })),
    confidence: v.number(),
  },
  handler: async (ctx, args) => {
    const historyId = await ctx.db.insert("issueHistory", {
      ...args,
      createdAt: Date.now(),
    });
    return historyId;
  },
});

export const getUserIssueHistory = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("issueHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

export const getRecentIssues = query({
  args: { 
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    return await ctx.db
      .query("issueHistory")
      .withIndex("by_created")
      .order("desc")
      .take(limit);
  },
});